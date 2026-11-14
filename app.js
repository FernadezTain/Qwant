const app = document.getElementById('app');
const authScreen = document.getElementById('authScreen');
const loginForm = document.getElementById('loginForm');
const verifyForm = document.getElementById('verifyForm');
const authError = document.getElementById('authError');
const chatList = document.getElementById('chatList');
const messages = document.getElementById('messages');
const searchInput = document.getElementById('searchInput');
const messageInput = document.getElementById('messageInput');
const accountButton = document.getElementById('accountButton');
const colors = ['#e8d5c8', '#b8c5a5', '#c4cce1', '#e7c9a0', '#d8b7c2', '#dfd9c8', '#d8c6b6'];
let session = readSession();
let chats = [];
let activeId = null;
let activeFilter = 'all';
let searchUsers = false;
let searchTimer;
let pendingChallenge = null;
let refreshing = false;

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
    role: data.role || 'user'
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
  accountButton.textContent = initials(session.username);
  accountButton.title = `Вы вошли как ${session.username}. Нажмите, чтобы выйти.`;
  document.getElementById('detailName').textContent = session.username;
  document.getElementById('detailHandle').textContent = `@${session.username}`;
  loadChats();
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
    time: formatTime(row.lastMessageAt),
    preview: row.lastMessage || 'Начните переписку',
    unread: Number(row.unreadCount) || 0,
    online: false,
    personal: true,
    messages: []
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

function renderMessages(chat) {
  if (!chat.messages.length) {
    messages.innerHTML = '<div class="empty-state">Здесь пока нет сообщений.<br>Напишите первым.</div>';
    return;
  }
  let previousDate = '';
  messages.innerHTML = chat.messages.map(message => {
    const day = dateLabel(message.createdAt);
    const datePill = day === previousDate ? '' : `<div class="date-pill">${escapeHtml(day)}</div>`;
    previousDate = day;
    const image = safeImageUrl(message.imageUrl);
    const text = message.text || (image ? ' ' : 'Сообщение без текста');
    return `${datePill}<div class="message-row ${message.own ? 'own' : ''}">
      ${message.own ? '' : avatarMarkup(chat.partner, 'message-avatar')}
      <div class="bubble">${image ? `<img class="message-photo" src="${escapeHtml(image)}" alt="Фото из сообщения">` : ''}${escapeHtml(text)}<div class="bubble-meta"><span>${escapeHtml(message.time)}</span>${message.own ? '<span class="checks">✓✓</span>' : ''}</div></div>
    </div>`;
  }).join('');
  messages.scrollTop = messages.scrollHeight;
}

async function loadChats() {
  if (!session?.sessionToken) return;
  try {
    const result = await api('/api/social/chats');
    chats = result.chats.map(mapChat);
    renderChats();
    if (activeId && !chats.some(chat => chat.id === activeId)) activeId = null;
    if (!activeId && chats.length) await selectChat(chats[0].id);
    if (!chats.length) messages.innerHTML = '<div class="empty-state">Начните новую переписку<br>с помощью кнопки +</div>';
  } catch (error) {
    if (error.status === 401) {
      localStorage.removeItem('ferniex_messenger_session');
      session = null;
      chats = [];
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
  messages.innerHTML = '<div class="empty-state">Загружаем переписку…</div>';
  renderChats();
  app.classList.add('show-conversation');
  try {
    const result = await api(`/api/social/chats/${encodeURIComponent(id)}/messages`);
    if (activeId !== id) return;
    chat.messages = result.messages.map(row => ({
      text: row.deleted_at ? 'Сообщение удалено' : row.body,
      imageUrl: row.deleted_at ? '' : row.image_url,
      createdAt: row.created_at,
      time: formatTime(row.created_at),
      own: String(row.sender_id) === String(session.userId)
    }));
    renderMessages(chat);
    try {
      await api(`/api/social/chats/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
    } catch {}
  } catch (error) {
    if (activeId === id) messages.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}

async function refreshChats() {
  if (refreshing) return;
  refreshing = true;
  const selectedId = activeId;
  try {
    await loadChats();
    if (selectedId && activeId === selectedId) await selectChat(selectedId);
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

document.getElementById('messageForm').addEventListener('submit', async event => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !activeId) return;
  const button = event.currentTarget.querySelector('.send-button');
  button.disabled = true;
  try {
    await api(`/api/social/chats/${encodeURIComponent(activeId)}/messages`, { method: 'POST', body: JSON.stringify({ body: text }) });
    messageInput.value = '';
    await Promise.all([loadChats(), selectChat(activeId)]);
  } catch (error) {
    messages.insertAdjacentHTML('beforeend', `<div class="empty-state">${escapeHtml(error.message)}</div>`);
  } finally {
    button.disabled = false;
    messageInput.focus();
  }
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

document.getElementById('backToChats').addEventListener('click', () => app.classList.remove('show-conversation'));
document.getElementById('newChat').addEventListener('click', () => {
  searchUsers = true;
  searchInput.value = '';
  searchInput.placeholder = 'Найдите пользователя';
  chatList.innerHTML = '<div class="empty-state">Введите имя пользователя FernieID</div>';
  searchInput.focus();
});
document.getElementById('emojiButton').addEventListener('click', () => {
  messageInput.value += ' 😊';
  messageInput.focus();
});
accountButton.addEventListener('click', () => {
  if (!confirm('Выйти из FernieX Messenger?')) return;
  localStorage.removeItem('ferniex_messenger_session');
  session = null;
  chats = [];
  activeId = null;
  showAuth();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && session?.sessionToken) refreshChats();
});

if (session?.sessionToken) {
  document.body.classList.remove('auth-locked');
  authScreen.classList.add('is-hidden');
  accountButton.textContent = initials(session.username);
  accountButton.title = `Вы вошли как ${session.username}. Нажмите, чтобы выйти.`;
  document.getElementById('detailName').textContent = session.username;
  document.getElementById('detailHandle').textContent = `@${session.username}`;
  loadChats();
} else {
  showAuth();
}

setInterval(() => {
  if (!document.hidden && session?.sessionToken) refreshChats();
}, 20000);
