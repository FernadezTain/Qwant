const app = document.getElementById('app');
const authScreen = document.getElementById('authScreen');
const loginForm = document.getElementById('loginForm');
const verifyForm = document.getElementById('verifyForm');
const authError = document.getElementById('authError');
const chatList = document.getElementById('chatList');
const messages = document.getElementById('messages');
const searchInput = document.getElementById('searchInput');
const messageInput = document.getElementById('messageInput');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const profileModal = document.getElementById('profileModal');
const settingsOverlay = document.getElementById('settingsOverlay');
const pageLoader = document.getElementById('pageLoader');
const colors = ['#e8d5c8', '#b8c5a5', '#c4cce1', '#e7c9a0', '#d8b7c2', '#dfd9c8', '#d8c6b6'];
let session = readSession();
let accountSettings = null;
let telegramId = null;
let deviceCheckTimer;
let chats = [];
let activeId = null;
let activeFilter = 'all';
let searchUsers = false;
let searchTimer;
let pendingChallenge = null;
let refreshing = false;
let chatsLoadedOnce = false;
let typingTimer;

function readSession() {
  try {
    return JSON.parse(localStorage.getItem('ferniex_messenger_session'));
  } catch {
    return null;
  }
}

function saveSession(data) {
  session = {
    sessionToken: data.sessionToken,
    userId: String(data.userId),
    username: data.username,
    role: data.role || 'user',
    deviceId: session?.deviceId || crypto.randomUUID()
  };
  localStorage.setItem('ferniex_messenger_session', JSON.stringify(session));
}

async function api(path, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  if (session?.sessionToken) headers.Authorization = `Bearer ${session.sessionToken}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const error = new Error(data.error || 'Не удалось выполнить запрос');
    error.status = response.status;
    throw error;
  }
  return data;
}

function setAuthError(message = '') {
  authError.textContent = message;
}

function showAuth(message = '') {
  document.body.classList.add('auth-locked');
  authScreen.classList.remove('is-hidden');
  loginForm.classList.remove('auth-hidden');
  verifyForm.classList.add('auth-hidden');
  document.getElementById('authTitle').textContent = 'Войдите в аккаунт';
  document.getElementById('authKicker').textContent = 'Ваше пространство для общения';
  document.getElementById('authCopy').textContent = 'Продолжите с FernieID — ваши существующие чаты уже ждут.';
  setAuthError(message);
  document.getElementById('authUsername').focus();
}

function setBusy(form, busy, label) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = busy;
  button.innerHTML = busy ? `${label}…` : `${label} <span>→</span>`;
}

function unlock(data) {
  saveSession(data);
  pendingChallenge = null;
  document.body.classList.remove('auth-locked');
  authScreen.classList.add('is-hidden');
  document.getElementById('authPassword').value = '';
  document.getElementById('authCode').value = '';
  updateAccountMenu();
  registerDevice().catch(() => {}).finally(() => {
    pageLoader.classList.add('hidden');
    loadChats();
    loadSettings().then(loadProducts);
    startDeviceChecks();
  });
}

function updateAccountMenu() {
  document.getElementById('drawerName').textContent = session?.username || 'FernieID';
  document.getElementById('drawerHandle').textContent = session?.userId ? `ID ${session.userId}` : 'Ваш аккаунт';
  document.getElementById('drawerAvatar').textContent = initials(session?.username);
  document.getElementById('accountProfileName').textContent = session?.username || '—';
  document.getElementById('accountProfileId').textContent = session?.userId ? `ID ${session.userId}` : 'FernieID';
  document.getElementById('accountProfileAvatar').textContent = initials(session?.username);
}

function hidePageLoader() {
  pageLoader.classList.add('hidden');
}

function applyPersonalization(settings = accountSettings) {
  const theme = settings?.theme || (localStorage.getItem('ferniex_messenger_dark') === 'true' ? 'dark' : 'light');
  document.body.classList.toggle('dark-theme', theme === 'dark');
  if (settings?.accent_color) document.body.style.setProperty('--accent', settings.accent_color);
  if (settings?.font_scale) document.body.style.setProperty('--page-zoom', Number(settings.font_scale) / 100);
  document.getElementById('themeState').textContent = theme === 'dark' ? 'Вкл.' : 'Выкл.';
}

function createDeviceId() {
  return crypto.randomUUID();
}

async function registerDevice() {
  if (!session?.sessionToken) return;
  session.deviceId ||= createDeviceId();
  localStorage.setItem('ferniex_messenger_session', JSON.stringify(session));
  await api('/api/qwant/devices/register', { method: 'POST', body: JSON.stringify({ deviceId: session.deviceId }) });
}

function endRevokedSession() {
  localStorage.removeItem('ferniex_messenger_session');
  session = null;
  accountSettings = null;
  telegramId = null;
  chats = [];
  activeId = null;
  clearInterval(deviceCheckTimer);
  hidePageLoader();
  document.getElementById('sessionNotice').classList.add('open');
  document.getElementById('sessionNotice').setAttribute('aria-hidden', 'false');
}

async function checkDeviceSession() {
  if (!session?.sessionToken || !session.deviceId) return;
  try {
    await api('/api/qwant/devices/check', { method: 'POST', body: JSON.stringify({ deviceId: session.deviceId }) });
  } catch (error) {
    if (error.status === 401) endRevokedSession();
  }
}

function startDeviceChecks() {
  clearInterval(deviceCheckTimer);
  deviceCheckTimer = setInterval(checkDeviceSession, 8000);
}

function setSwitch(button, checked, disabled = false) {
  button.setAttribute('aria-checked', String(checked));
  button.disabled = disabled;
}

function renderSettings(settings) {
  accountSettings = settings;
  telegramId = settings.telegramId || null;
  setSwitch(document.getElementById('browserNotifications'), settings.settings.notifications_enabled !== false);
  setSwitch(document.getElementById('telegramNotifications'), settings.settings.telegram_notifications_enabled === true, !telegramId);
  document.getElementById('telegramAccountLabel').textContent = telegramId ? `ID: ${telegramId}` : 'Telegram не привязан';
  document.getElementById('linkTelegramButton').hidden = !!telegramId;
  document.querySelectorAll('[data-setting]').forEach(button => setSwitch(button, settings.settings[button.dataset.setting] !== false));
  const values = settings.settings;
  document.getElementById('themeSelect').value = values.theme || 'light';
  document.querySelectorAll('.color-option').forEach(button => button.classList.toggle('active', button.dataset.color === values.accent_color));
  document.getElementById('fontScale').value = values.font_scale || 100;
  document.getElementById('fontScaleLabel').textContent = `${values.font_scale || 100}%`;
  applyPersonalization(values);
}

async function loadSettings() {
  const status = document.getElementById('telegramSettingsStatus');
  status.textContent = 'Загружаем настройки…';
  try {
    const result = await api('/api/qwant/settings');
    renderSettings(result);
    status.textContent = result.telegramId ? 'Telegram привязан к аккаунту.' : 'Привяжите Telegram в FernieID, чтобы включить уведомления.';
  } catch (error) {
    status.textContent = error.message;
  }
}

async function saveSetting(key, value, button) {
  const oldValue = accountSettings?.settings?.[key];
  button.disabled = true;
  try {
    await api('/api/qwant/settings', { method: 'PATCH', body: JSON.stringify({ [key]: value }) });
    accountSettings.settings[key] = value;
    if (key === 'theme' || key === 'accent_color' || key === 'font_scale') applyPersonalization(accountSettings.settings);
  } catch (error) {
    button.setAttribute('aria-checked', String(oldValue !== false));
    document.getElementById('telegramSettingsStatus').textContent = error.message;
  } finally {
    button.disabled = key === 'telegram_notifications_enabled' && !telegramId;
  }
}

async function loadDevices() {
  const list = document.getElementById('devicesList');
  const status = document.getElementById('devicesStatus');
  list.innerHTML = '<div class="settings-note">Загружаем активные устройства…</div>';
  try {
    const result = await api('/api/qwant/devices');
    list.innerHTML = result.devices.length ? result.devices.map(device => `
      <article class="device-card"><div class="device-head"><div><div class="device-title">${escapeHtml(device.device_name)}</div><div class="device-meta">${device.device_id === session.deviceId ? '<span class="device-current">Это устройство</span><br>' : ''}Последняя активность: ${escapeHtml(formatDateTime(device.last_seen_at))}</div></div>${device.device_id === session.deviceId ? '' : `<button class="settings-button danger" data-revoke-device="${escapeHtml(device.device_id)}" type="button">Завершить</button>`}</div></article>`).join('') : '<div class="settings-note">Активных устройств не найдено.</div>';
    list.querySelectorAll('[data-revoke-device]').forEach(button => button.addEventListener('click', () => revokeDevice(button.dataset.revokeDevice, button)));
    status.textContent = '';
  } catch (error) {
    list.innerHTML = '';
    status.textContent = error.message;
  }
}

async function revokeDevice(deviceId, button) {
  button.disabled = true;
  try {
    await api(`/api/qwant/devices/${encodeURIComponent(deviceId)}`, { method: 'DELETE' });
    if (deviceId === session.deviceId) return endRevokedSession();
    await loadDevices();
  } catch (error) {
    document.getElementById('devicesStatus').textContent = error.message;
    button.disabled = false;
  }
}

async function loadProducts() {
  try {
    const data = await api('/api/qwant/account');
    const plus = data.ferniePlus;
    const expires = plus?.end_time ? formatDateTime(Number(plus.end_time) * 1000) : '';
    document.getElementById('plusStatus').textContent = plus?.active ? `Подписка активна${expires ? ` до ${expires}` : ''}` : 'Подписка не активна';
    const coins = data.fernieCoins;
    document.getElementById('coinsBalance').textContent = coins === null || coins === undefined ? 'Баланс недоступен' : `${new Intl.NumberFormat('ru-RU').format(coins)} FernieCoins`;
    document.getElementById('coinsMenuBalance').textContent = coins === null || coins === undefined ? '—' : new Intl.NumberFormat('ru-RU').format(coins);
  } catch (error) {
    document.getElementById('plusStatus').textContent = error.message;
    document.getElementById('coinsBalance').textContent = 'Баланс временно недоступен';
  }
}

async function openSettings(page = 'notifications') {
  closeDrawer();
  settingsOverlay.classList.add('open');
  settingsOverlay.setAttribute('aria-hidden', 'false');
  showSettingsPage(page);
  await loadSettings();
  if (page === 'devices') loadDevices();
  if (page === 'plus' || page === 'coins') loadProducts();
}

function showSettingsPage(page) {
  document.querySelectorAll('[data-settings-page]').forEach(button => button.classList.toggle('active', button.dataset.settingsPage === page));
  document.querySelectorAll('[data-settings-content]').forEach(section => section.classList.toggle('active', section.dataset.settingsContent === page));
  const label = document.querySelector(`[data-settings-page="${page}"]`)?.textContent.replace(/[♧▣◈✳✦◉]/g, '').trim() || 'Настройки';
  document.getElementById('settingsTitle').textContent = `Настройки Qwant · ${label}`;
}

function closeSettings() {
  settingsOverlay.classList.remove('open');
  settingsOverlay.setAttribute('aria-hidden', 'true');
}

function openDrawer() {
  drawerBackdrop.classList.add('open');
  drawerBackdrop.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawerBackdrop.classList.remove('open');
  drawerBackdrop.setAttribute('aria-hidden', 'true');
}

function openProfile(person = null) {
  const username = person?.username || session?.username || 'FernieID';
  const userId = person?.id || session?.userId;
  document.getElementById('profileTitle').textContent = person ? 'Профиль контакта' : 'Мой профиль';
  document.getElementById('accountProfileName').textContent = username;
  document.getElementById('accountProfileId').textContent = userId ? `ID ${userId}` : 'FernieID';
  setAvatar(document.getElementById('accountProfileAvatar'), { ...person, username, id: userId });
  profileModal.classList.add('open');
  profileModal.setAttribute('aria-hidden', 'false');
}

function closeProfile() {
  profileModal.classList.remove('open');
  profileModal.setAttribute('aria-hidden', 'true');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function initials(name = '') {
  return String(name).trim().split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('ru') || 'FX';
}

function avatarMarkup(person, className = 'avatar') {
  const name = person.username || person.name || 'Пользователь';
  const color = colors[Math.abs(Number(String(person.id || name).replace(/\D/g, '').slice(-6)) || name.length) % colors.length];
  const photo = safeImageUrl(person.avatar_url);
  return `<span class="${className}" style="background:${color}">${photo ? `<img src="${escapeHtml(photo)}" alt="">` : escapeHtml(initials(name))}</span>`;
}

function setAvatar(element, person) {
  const photo = safeImageUrl(person.avatar_url);
  element.style.background = colors[Math.abs(Number(String(person.id || person.username || '').replace(/\D/g, '').slice(-6)) || String(person.username || '').length) % colors.length];
  element.replaceChildren();
  if (photo) {
    const image = document.createElement('img');
    image.src = photo;
    image.alt = '';
    element.append(image);
  } else {
    element.textContent = initials(person.username);
  }
}

function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  if (date.toDateString() === new Date().toDateString()) return new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString() ? 'Вчера' : new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('ru', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function dateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Сообщения';
  if (date.toDateString() === new Date().toDateString()) return 'Сегодня';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString() ? 'Вчера' : new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function mapChat(row) {
  const partner = row.partner || {};
  const name = partner.username || 'Пользователь';
  return {
    id: row.id,
    partner,
    name,
    handle: `@${name}`,
    initials: initials(name),
    color: colors[Math.abs(Number(String(partner.id || name).replace(/\D/g, '').slice(-6)) || name.length) % colors.length],
    lastMessageAt: row.lastMessageAt,
    time: formatTime(row.lastMessageAt),
    preview: row.lastMessage || 'Начните переписку',
    unread: Number(row.unreadCount) || 0,
    online: false,
    personal: true,
    messages: [],
    messagesLoaded: false
  };
}

function renderChats() {
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  const filtered = chats.filter(chat => {
    const matchesQuery = `${chat.name} ${chat.preview} ${chat.handle}`.toLocaleLowerCase('ru').includes(query);
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'unread' ? chat.unread > 0 : chat.personal);
    return matchesQuery && matchesFilter;
  });
  chatList.innerHTML = filtered.length ? filtered.map(chat => `
    <button class="chat-item ${chat.id === activeId ? 'active' : ''}" data-chat="${escapeHtml(chat.id)}">
      <span class="avatar-wrap">${avatarMarkup(chat.partner)}${chat.online ? '<span class="online-dot"></span>' : ''}</span>
      <span class="chat-copy"><span class="chat-top"><span class="chat-name">${escapeHtml(chat.name)}</span><span class="chat-time">${escapeHtml(chat.time)}</span></span><span class="chat-bottom"><span class="chat-preview">${escapeHtml(chat.preview)}</span>${chat.unread ? `<span class="unread">${chat.unread}</span>` : ''}</span></span>
    </button>`).join('') : `<div class="empty-state">${query ? 'Ничего не найдено' : 'Здесь появятся ваши чаты'}</div>`;
  chatList.querySelectorAll('[data-chat]').forEach(button => button.addEventListener('click', () => selectChat(button.dataset.chat)));
}

function messageMarkup(chat, message, previousDate = '', animate = false) {
  const day = dateLabel(message.createdAt);
  const datePill = day === previousDate ? '' : `<div class="date-pill">${escapeHtml(day)}</div>`;
  const image = safeImageUrl(message.imageUrl);
  const text = message.text || (image ? ' ' : 'Сообщение без текста');
  return `${datePill}<div class="message-row ${message.own ? 'own' : ''} ${animate ? 'message-new' : ''}" data-message-id="${escapeHtml(message.id)}">
    ${message.own ? '' : avatarMarkup(chat.partner, 'message-avatar')}
    <div class="bubble">${image ? `<img class="message-photo" src="${escapeHtml(image)}" alt="Фото из сообщения">` : ''}${escapeHtml(text)}<div class="bubble-meta"><span>${escapeHtml(message.time)}</span>${message.own ? `<span class="checks">${message.readAt ? '✓✓' : '✓'}</span>` : ''}</div></div>
  </div>`;
}

function renderMessages(chat) {
  if (!chat.messages.length) {
    messages.innerHTML = '<div class="empty-state">Здесь пока нет сообщений.<br>Напишите первым.</div>';
    return;
  }
  let previousDate = '';
  messages.innerHTML = chat.messages.map(message => {
    const markup = messageMarkup(chat, message, previousDate);
    previousDate = dateLabel(message.createdAt);
    return markup;
  }).join('');
  messages.scrollTop = messages.scrollHeight;
}

function mapMessages(rows) {
  return rows.map(row => ({
    id: row.id,
    text: row.deleted_at ? 'Сообщение удалено' : row.body,
    imageUrl: row.deleted_at ? '' : row.image_url,
    createdAt: row.created_at,
    time: formatTime(row.created_at),
    readAt: row.read_at,
    own: String(row.sender_id) === String(session.userId)
  }));
}

function updateMessages(chat, latest) {
  const oldMessages = chat.messages;
  if (!chat.messagesLoaded) {
    chat.messages = latest;
    chat.messagesLoaded = true;
    renderMessages(chat);
    return true;
  }
  const canAppend = oldMessages.length > 0 && oldMessages.every((message, index) => {
    const next = latest[index];
    return next && message.id === next.id && message.text === next.text && message.imageUrl === next.imageUrl && message.readAt === next.readAt;
  });
  if (canAppend && latest.length > oldMessages.length) {
    let previousDate = dateLabel(oldMessages[oldMessages.length - 1].createdAt);
    messages.insertAdjacentHTML('beforeend', latest.slice(oldMessages.length).map(message => {
      const markup = messageMarkup(chat, message, previousDate, true);
      previousDate = dateLabel(message.createdAt);
      return markup;
    }).join(''));
    chat.messages = latest;
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    return true;
  } else if (oldMessages.length !== latest.length || oldMessages.some((message, index) => {
    const next = latest[index];
    return !next || message.id !== next.id || message.text !== next.text || message.imageUrl !== next.imageUrl || message.readAt !== next.readAt;
  })) {
    chat.messages = latest;
    renderMessages(chat);
    return true;
  }
  return false;
}

function isConversationVisible() {
  return window.matchMedia('(max-width: 760px)').matches
    ? app.classList.contains('show-conversation')
    : activeId !== null;
}

async function loadChatMessages(chat, showLoader = false) {
  if (showLoader && !chat.messagesLoaded) {
    messages.innerHTML = '<div class="messages-loading"><span class="loading-spinner"></span><span>Загружаем переписку</span><span class="loading-dots"><i></i><i></i><i></i></span></div>';
  }
  try {
    const result = await api(`/api/social/chats/${encodeURIComponent(chat.id)}/messages`);
    if (activeId !== chat.id) return;
    const changed = updateMessages(chat, mapMessages(result.messages));
    if (changed) renderSharedDetails(chat);
    const presence = await api(`/api/social/chats/${encodeURIComponent(chat.id)}/presence`).catch(() => null);
    if (presence && activeId === chat.id) {
      document.getElementById('headerStatus').textContent = presence.typing ? 'печатает…' : presence.inChat ? 'в сети' : chat.handle;
    }
    await api(`/api/social/chats/${encodeURIComponent(chat.id)}/presence`, { method: 'POST', body: JSON.stringify({ typing: false }) }).catch(() => {});
    try {
      await api(`/api/social/chats/${encodeURIComponent(chat.id)}/read`, { method: 'PATCH' });
    } catch {}
  } catch (error) {
    if (activeId === chat.id && !chat.messagesLoaded) {
      messages.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }
}

function renderSharedDetails(chat) {
  const media = chat.messages.filter(message => message.imageUrl && safeImageUrl(message.imageUrl));
  const links = [];
  const seen = new Set();
  chat.messages.forEach(message => {
    for (const match of String(message.text || '').matchAll(/https?:\/\/[^\s<>"']+/giu)) {
      const href = safeImageUrl(match[0].replace(/[),.!?]+$/, ''));
      if (href && !seen.has(href)) {
        seen.add(href);
        links.push({ href, createdAt: message.createdAt });
      }
    }
  });
  document.getElementById('mediaCount').textContent = media.length;
  document.getElementById('mediaGrid').innerHTML = media.slice(0, 9).map(item => `<a class="media-tile" href="${escapeHtml(safeImageUrl(item.imageUrl))}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(safeImageUrl(item.imageUrl))}" alt="Фото из переписки" loading="lazy"></a>`).join('');
  document.getElementById('mediaEmpty').hidden = media.length > 0;
  document.getElementById('linkCount').textContent = links.length;
  document.getElementById('sharedLinks').innerHTML = links.slice(0, 12).map(link => `<a class="shared-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer"><span class="link-icon"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/></svg></span><span>${escapeHtml(new URL(link.href).hostname)}<br><small style="color:var(--muted)">${escapeHtml(formatTime(link.createdAt))}</small></span></a>`).join('');
  document.getElementById('linksEmpty').hidden = links.length > 0;
}

async function loadChats() {
  if (!session?.sessionToken) return;
  try {
    const result = await api('/api/social/chats');
    const previousChats = new Map(chats.map(chat => [chat.id, chat]));
    const nextChats = result.chats.map(row => {
      const chat = mapChat(row);
      const previous = previousChats.get(chat.id);
      if (previous) {
        chat.messages = previous.messages;
        chat.messagesLoaded = previous.messagesLoaded;
      }
      return chat;
    });
    if (document.hidden && accountSettings?.settings.notifications_enabled !== false && 'Notification' in window && Notification.permission === 'granted') {
      nextChats.forEach(chat => {
        const previousUnread = previousChats.get(chat.id)?.unread || 0;
        if (chat.unread > previousUnread) new Notification(`Сообщение от ${chat.name}`, { body: chat.preview, tag: chat.id });
      });
    }
    const loadedIds = new Set(nextChats.map(chat => chat.id));
    const pendingChat = chats.find(chat => chat.id === activeId && !chat.lastMessageAt && !loadedIds.has(chat.id));
    chats = pendingChat ? [...nextChats, pendingChat] : nextChats;
    renderChats();
    if (activeId && !chats.some(chat => chat.id === activeId)) {
      activeId = null;
      app.classList.remove('show-conversation');
    }
    const firstLoad = !chatsLoadedOnce;
    chatsLoadedOnce = true;
    if (firstLoad && !activeId && chats.length) await selectChat(chats[0].id);
    if (!chats.length) messages.innerHTML = '<div class="empty-state">Начните новую переписку<br>с помощью кнопки +</div>';
  } catch (error) {
    if (error.status === 401) {
      localStorage.removeItem('ferniex_messenger_session');
      session = null;
      accountSettings = null;
      telegramId = null;
      chats = [];
      chatsLoadedOnce = false;
      showAuth('Сессия FernieID завершилась. Войдите снова.');
      return;
    }
    chatList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}<br>Обновите список позже.</div>`;
  }
}

async function selectChat(id) {
  const chat = chats.find(item => item.id === id);
  if (!chat) return;
  activeId = id;
  chat.unread = 0;
  setAvatar(document.getElementById('headerAvatar'), chat.partner);
  document.getElementById('headerName').textContent = chat.name;
  document.getElementById('headerStatus').textContent = chat.handle;
  setAvatar(document.getElementById('detailAvatar'), chat.partner);
  document.getElementById('detailName').textContent = chat.name;
  document.getElementById('detailHandle').textContent = chat.handle;
  document.getElementById('detailStatus').textContent = '● личный чат';
  document.getElementById('mediaGrid').replaceChildren();
  document.getElementById('sharedLinks').replaceChildren();
  document.getElementById('mediaCount').textContent = '0';
  document.getElementById('linkCount').textContent = '0';
  document.getElementById('mediaEmpty').hidden = false;
  document.getElementById('linksEmpty').hidden = false;
  if (chat.messagesLoaded) {
    renderMessages(chat);
    renderSharedDetails(chat);
  } else {
    messages.innerHTML = '<div class="messages-loading"><span class="loading-spinner"></span><span>Загружаем переписку</span><span class="loading-dots"><i></i><i></i><i></i></span></div>';
  }
  renderChats();
  app.classList.add('show-conversation');
  await loadChatMessages(chat, !chat.messagesLoaded);
}

async function refreshChats() {
  if (refreshing) return;
  refreshing = true;
  const shouldRefreshConversation = isConversationVisible();
  try {
    await loadChats();
    if (shouldRefreshConversation && activeId) {
      const chat = chats.find(item => item.id === activeId);
      if (chat) await loadChatMessages(chat);
    }
  } finally {
    refreshing = false;
  }
}

async function searchPeople(query) {
  if (!session?.sessionToken || !query) return;
  try {
    const result = await api(`/api/social/chat-users?q=${encodeURIComponent(query)}`);
    chatList.innerHTML = result.users.length ? result.users.map(person => `
      <button class="chat-item" data-person="${escapeHtml(person.id)}">
        <span class="avatar-wrap">${avatarMarkup(person)}</span>
        <span class="chat-copy"><span class="chat-top"><span class="chat-name">${escapeHtml(person.username)}</span></span><span class="chat-preview">Начать переписку</span></span>
      </button>`).join('') : '<div class="empty-state">Пользователи не найдены</div>';
    chatList.querySelectorAll('[data-person]').forEach(button => button.addEventListener('click', () => openChat(button.dataset.person)));
  } catch (error) {
    chatList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

async function openChat(recipientId) {
  try {
    const result = await api('/api/social/chats', { method: 'POST', body: JSON.stringify({ recipientId }) });
    const existing = chats.find(chat => chat.id === result.conversation.id);
    if (!existing) chats.unshift(mapChat({ id: result.conversation.id, partner: result.partner, lastMessage: result.conversation.last_message_text, lastMessageAt: result.conversation.last_message_at, unreadCount: 0 }));
    searchUsers = false;
    searchInput.value = '';
    searchInput.placeholder = 'Поиск по чатам';
    renderChats();
    await selectChat(result.conversation.id);
  } catch (error) {
    chatList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  setAuthError();
  setBusy(loginForm, true, 'Проверяем');
  try {
    const result = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: document.getElementById('authUsername').value.trim(), password: document.getElementById('authPassword').value })
    });
    if (result.require2fa) {
      pendingChallenge = result.challengeId;
      loginForm.classList.add('auth-hidden');
      verifyForm.classList.remove('auth-hidden');
      document.getElementById('authTitle').textContent = 'Подтвердите вход';
      document.getElementById('authKicker').textContent = 'Ещё один шаг для защиты аккаунта';
      document.getElementById('authCopy').textContent = 'Мы отправили одноразовый код в Telegram, привязанный к FernieID.';
      document.getElementById('authCode').focus();
    } else {
      unlock(result);
    }
  } catch (error) {
    setAuthError(error.message);
  } finally {
    setBusy(loginForm, false, 'Продолжить');
  }
});

verifyForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!pendingChallenge) return showAuth('Запрос входа устарел. Введите логин и пароль снова.');
  setAuthError();
  setBusy(verifyForm, true, 'Проверяем код');
  try {
    const result = await api('/api/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ challengeId: pendingChallenge, code: document.getElementById('authCode').value.trim() })
    });
    unlock(result);
  } catch (error) {
    setAuthError(error.message);
  } finally {
    setBusy(verifyForm, false, 'Подтвердить вход');
  }
});

document.getElementById('backToLogin').addEventListener('click', () => {
  pendingChallenge = null;
  verifyForm.classList.add('auth-hidden');
  loginForm.classList.remove('auth-hidden');
  document.getElementById('authTitle').textContent = 'Войдите в аккаунт';
  document.getElementById('authKicker').textContent = 'Ваше пространство для общения';
  document.getElementById('authCopy').textContent = 'Продолжите с FernieID — ваши существующие чаты уже ждут.';
  document.getElementById('authCode').value = '';
  setAuthError();
});

async function sendMessage(body, imageBase64 = '') {
  if (!activeId || (!body && !imageBase64)) return;
  try {
    await api(`/api/social/chats/${encodeURIComponent(activeId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body, ...(imageBase64 ? { imageBase64 } : {}) })
    });
    messageInput.value = '';
    await Promise.all([loadChats(), selectChat(activeId)]);
  } catch (error) {
    messages.insertAdjacentHTML('beforeend', `<div class="empty-state">${escapeHtml(error.message)}</div>`);
  }
  messageInput.focus();
}

document.getElementById('messageForm').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('.send-button');
  const text = messageInput.value.trim();
  if (!text || !activeId) return;
  button.disabled = true;
  await sendMessage(text);
  button.disabled = false;
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  if (searchUsers) {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      chatList.innerHTML = '<div class="empty-state">Введите минимум 2 символа</div>';
      return;
    }
    searchTimer = setTimeout(() => searchPeople(query), 250);
    return;
  }
  renderChats();
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.filter.active')?.classList.remove('active');
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  renderChats();
}));

document.getElementById('backToChats').addEventListener('click', () => {
  if (activeId) api(`/api/social/chats/${encodeURIComponent(activeId)}/presence`, { method: 'DELETE' }).catch(() => {});
  app.classList.remove('show-conversation');
});
document.getElementById('newChat').addEventListener('click', () => {
  searchUsers = true;
  searchInput.value = '';
  searchInput.placeholder = 'Найдите пользователя';
  chatList.innerHTML = '<div class="empty-state">Введите имя пользователя FernieID</div>';
  searchInput.focus();
});
document.getElementById('menuToggle').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', event => {
  if (event.target === drawerBackdrop) closeDrawer();
});
document.getElementById('drawerNewChat').addEventListener('click', () => {
  closeDrawer();
  document.getElementById('newChat').click();
});
document.getElementById('drawerProfileButton').addEventListener('click', () => {
  closeDrawer();
  openProfile();
});
document.getElementById('drawerProfile').addEventListener('click', () => {
  closeDrawer();
  openProfile();
});
document.getElementById('drawerSettings').addEventListener('click', () => openSettings());
document.getElementById('drawerPlus').addEventListener('click', () => openSettings('plus'));
document.getElementById('drawerCoins').addEventListener('click', () => openSettings('coins'));
document.getElementById('profileOpenButton').addEventListener('click', () => {
  const chat = chats.find(item => item.id === activeId);
  if (chat) openProfile(chat.partner);
});
document.getElementById('profileMessageButton').addEventListener('click', () => messageInput.focus());
document.getElementById('profileClose').addEventListener('click', closeProfile);
profileModal.addEventListener('click', event => {
  if (event.target === profileModal) closeProfile();
});
document.getElementById('themeToggle').addEventListener('click', () => {
  const enabled = !document.body.classList.contains('dark-theme');
  const button = document.getElementById('themeToggle');
  accountSettings ||= { settings: {} };
  accountSettings.settings.theme = enabled ? 'dark' : 'light';
  applyPersonalization(accountSettings.settings);
  api('/api/qwant/settings', { method: 'PATCH', body: JSON.stringify({ theme: accountSettings.settings.theme }) }).catch(() => {});
});
document.getElementById('detailsToggle').addEventListener('click', () => {
  if (window.matchMedia('(max-width: 1180px)').matches) app.classList.add('show-details');
  else app.classList.remove('details-hidden');
});
document.getElementById('detailsClose').addEventListener('click', () => {
  if (window.matchMedia('(max-width: 1180px)').matches) app.classList.remove('show-details');
  else app.classList.add('details-hidden');
});
document.getElementById('messageSearchButton').addEventListener('click', () => {
  const query = window.prompt('Поиск в текущей переписке');
  if (!query?.trim()) return;
  const target = [...messages.querySelectorAll('.bubble')].find(bubble => bubble.textContent.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
  messages.querySelectorAll('.search-highlight').forEach(bubble => bubble.classList.remove('search-highlight'));
  if (!target) return window.alert('Сообщение не найдено');
  target.classList.add('search-highlight');
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.getElementById('attachButton').addEventListener('click', () => document.getElementById('attachInput').click());
document.getElementById('attachInput').addEventListener('change', event => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return window.alert('Можно прикрепить JPG, PNG или WEBP.');
  if (file.size > 8 * 1024 * 1024) return window.alert('Размер фото не должен превышать 8 МБ.');
  const reader = new FileReader();
  reader.onload = () => sendMessage('', String(reader.result));
  reader.onerror = () => window.alert('Не удалось прочитать файл.');
  reader.readAsDataURL(file);
});
document.getElementById('emojiButton').addEventListener('click', () => {
  messageInput.value += ' 😊';
  messageInput.focus();
});
messageInput.addEventListener('input', () => {
  if (!activeId || !messageInput.value.trim()) return;
  api(`/api/social/chats/${encodeURIComponent(activeId)}/presence`, { method: 'POST', body: JSON.stringify({ typing: true }) }).catch(() => {});
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    if (activeId) api(`/api/social/chats/${encodeURIComponent(activeId)}/presence`, { method: 'POST', body: JSON.stringify({ typing: false }) }).catch(() => {});
  }, 1600);
});
function logout() {
  if (!confirm('Выйти из Qwant Messenger?')) return;
  const finishLogout = () => {
    localStorage.removeItem('ferniex_messenger_session');
    session = null;
    accountSettings = null;
    telegramId = null;
    chats = [];
    chatsLoadedOnce = false;
    activeId = null;
    clearInterval(deviceCheckTimer);
    closeDrawer();
    closeProfile();
    showAuth();
  };
  const request = session?.deviceId
    ? api(`/api/qwant/devices/${encodeURIComponent(session.deviceId)}`, { method: 'DELETE' })
    : Promise.resolve();
  request.catch(() => {}).finally(finishLogout);
}
document.getElementById('drawerLogout').addEventListener('click', logout);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDrawer();
    closeProfile();
    app.classList.remove('show-details');
  }
});

document.addEventListener('visibilitychange', () => {
  if (session?.sessionToken) {
    checkDeviceSession();
    if (!document.hidden) {
      refreshChats();
      loadSettings();
    }
  }
});

document.getElementById('settingsClose').addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', event => {
  if (event.target === settingsOverlay) closeSettings();
});
document.querySelectorAll('[data-settings-page]').forEach(button => button.addEventListener('click', () => {
  const page = button.dataset.settingsPage;
  showSettingsPage(page);
  if (page === 'devices') loadDevices();
  if (page === 'plus' || page === 'coins') loadProducts();
}));
document.getElementById('browserNotifications').addEventListener('click', async event => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-checked') !== 'true';
  if (enabled && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  button.setAttribute('aria-checked', String(enabled));
  accountSettings.settings.notifications_enabled = enabled;
  await saveSetting('notifications_enabled', enabled, button);
});
document.getElementById('telegramNotifications').addEventListener('click', event => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-checked') !== 'true';
  button.setAttribute('aria-checked', String(enabled));
  saveSetting('telegram_notifications_enabled', enabled, button);
});
document.querySelectorAll('[data-setting]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.setting;
  const enabled = button.getAttribute('aria-checked') !== 'true';
  button.setAttribute('aria-checked', String(enabled));
  saveSetting(key, enabled, button);
}));
document.getElementById('linkTelegramButton').addEventListener('click', () => window.open('https://ferniex-id.vercel.app/#security', '_blank', 'noopener,noreferrer'));
document.getElementById('themeSelect').addEventListener('change', event => saveSetting('theme', event.target.value, event.target));
document.getElementById('accentOptions').addEventListener('click', event => {
  const button = event.target.closest('[data-color]');
  if (!button) return;
  document.querySelectorAll('.color-option').forEach(item => item.classList.toggle('active', item === button));
  saveSetting('accent_color', button.dataset.color, button);
});
document.getElementById('fontScale').addEventListener('change', event => {
  const value = Number(event.target.value);
  document.getElementById('fontScaleLabel').textContent = `${value}%`;
  saveSetting('font_scale', value, event.target);
});
document.getElementById('openFernieIdPlus').addEventListener('click', () => window.open('https://ferniex-id.vercel.app/', '_blank', 'noopener,noreferrer'));
document.getElementById('openFernieIdCoins').addEventListener('click', () => window.open('https://ferniex-id.vercel.app/', '_blank', 'noopener,noreferrer'));
document.getElementById('sessionNoticeOk').addEventListener('click', () => {
  document.getElementById('sessionNotice').classList.remove('open');
  document.getElementById('sessionNotice').setAttribute('aria-hidden', 'true');
  showAuth('Сессия завершена. Войдите снова.');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSettings();
});

async function bootstrap() {
  if (!session?.sessionToken) {
    hidePageLoader();
    showAuth();
    return;
  }
  document.body.classList.remove('auth-locked');
  authScreen.classList.add('is-hidden');
  updateAccountMenu();
  try {
    if (!session.deviceId) await registerDevice();
    else await checkDeviceSession();
    if (!session) return;
    startDeviceChecks();
    await Promise.all([loadChats(), loadSettings()]);
    hidePageLoader();
    loadProducts();
  } catch (error) {
    if (error.status === 401) {
      endRevokedSession();
      hidePageLoader();
      return;
    }
    hidePageLoader();
    loadChats();
  }
}

bootstrap();

setInterval(() => {
  if (session?.sessionToken) {
    checkDeviceSession();
    refreshChats();
  }
}, 8000);
