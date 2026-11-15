const app = document.getElementById('app');
const authScreen = document.getElementById('authScreen');
const nicknameForm = document.getElementById('nicknameForm');
const loginForm = document.getElementById('loginForm');
const signupPasswordForm = document.getElementById('signupPasswordForm');
const displayNameForm = document.getElementById('displayNameForm');
const verifyForm = document.getElementById('verifyForm');
const authError = document.getElementById('authError');
const authCodeInput = document.getElementById('authCode');
const authCodeBoxes = document.getElementById('authCodeBoxes');
const authCodeSlots = [...authCodeBoxes.querySelectorAll('.auth-code-slot')];
const chatList = document.getElementById('chatList');
const messages = document.getElementById('messages');
const searchInput = document.getElementById('searchInput');
const messageInput = document.getElementById('messageInput');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const profileScreen = document.getElementById('profileScreen');
const appDialog = document.getElementById('appDialog');
const settingsOverlay = document.getElementById('settingsOverlay');
const photoSendModal = document.getElementById('photoSendModal');
const photoSendPreview = document.getElementById('photoSendPreview');
const photoSendCaption = document.getElementById('photoSendCaption');
const photoViewer = document.getElementById('photoViewer');
const photoViewerImage = document.getElementById('photoViewerImage');
const photoViewerCount = document.getElementById('photoViewerCount');
const photoViewerCaption = document.getElementById('photoViewerCaption');
const photoViewerDownload = document.getElementById('photoViewerDownload');
const photoViewerStage = document.getElementById('photoViewerStage');
const emojiButton = document.getElementById('emojiButton');
const emojiPicker = document.getElementById('emojiPicker');
const emojiPickerWrap = document.getElementById('emojiPickerWrap');
const emojiSearch = document.getElementById('emojiSearch');
const emojiCategoriesElement = document.getElementById('emojiCategories');
const emojiGrid = document.getElementById('emojiGrid');
const pageLoader = document.getElementById('pageLoader');
const colors = ['#e8d5c8', '#b8c5a5', '#c4cce1', '#e7c9a0', '#d8b7c2', '#dfd9c8', '#d8c6b6'];
const emojiCategories = [
  { id:'smileys', label:'Смайлы', icon:'😀', items:[['😀','улыбка'],['😃','улыбка радость'],['😄','смех'],['😁','зубы'],['😆','смеюсь'],['😅','неловко пот'],['😂','слезы смех'],['🤣','катаюсь смех'],['🙂','улыбка'],['🙃','перевернутый'],['😉','подмигивание'],['😊','доволен'],['😇','ангел'],['🥰','любовь'],['😍','сердечки'],['😘','поцелуй'],['😋','вкусно'],['😛','язык'],['😜','подмигнул язык'],['🤪','сумасшедший'],['😎','круто очки'],['🤓','умный'],['🤔','думаю'],['🫡','салют'],['🤨','сомнение'],['😐','нейтрально'],['😶','без слов'],['🙄','закатил глаза'],['😏','ухмылка'],['😴','сон'],['🥱','зевота'],['😭','плачу'],['😤','злюсь'],['😡','злость'],['🤯','взрыв мозга'],['🥳','праздник'],['🤗','обнимаю'],['🫶','сердце руками']] },
  { id:'people', label:'Жесты', icon:'👋', items:[['👋','привет'],['🤚','ладонь'],['🖐️','пальцы'],['✋','стоп'],['🫱','рука вправо'],['🫲','рука влево'],['🫳','ладонь вниз'],['🫴','ладонь вверх'],['👌','ок'],['🤌','пальцы'],['🤏','чуть чуть'],['✌️','победа'],['🤞','удача'],['🫰','палец сердце'],['🤟','люблю'],['🤘','рок'],['🤙','позвони'],['👈','влево'],['👉','вправо'],['👆','вверх'],['👇','вниз'],['☝️','указательный'],['👍','лайк'],['👎','дизлайк'],['✊','кулак'],['👊','удар'],['👏','аплодисменты'],['🙌','ура'],['🙏','спасибо пожалуйста'],['💪','сила']] },
  { id:'animals', label:'Животные', icon:'🐻', items:[['🐶','собака'],['🐱','кошка'],['🐭','мышь'],['🐹','хомяк'],['🐰','кролик'],['🦊','лиса'],['🐻','медведь'],['🐼','панда'],['🐨','коала'],['🐯','тигр'],['🦁','лев'],['🐮','корова'],['🐸','лягушка'],['🐵','обезьяна'],['🐔','курица'],['🐧','пингвин'],['🐦','птица'],['🦆','утка'],['🦉','сова'],['🦇','летучая мышь'],['🐺','волк'],['🐗','кабан'],['🐴','лошадь'],['🦄','единорог'],['🐝','пчела'],['🦋','бабочка'],['🐌','улитка'],['🐞','божья коровка'],['🐢','черепаха'],['🐍','змея'],['🐙','осьминог'],['🦀','краб'],['🐬','дельфин'],['🐳','кит'],['🦈','акула'],['🐊','крокодил'],['🦖','динозавр'],['🌵','кактус'],['🌹','роза'],['🌻','подсолнух']] },
  { id:'food', label:'Еда', icon:'🍕', items:[['🍏','яблоко'],['🍎','красное яблоко'],['🍐','груша'],['🍊','апельсин'],['🍋','лимон'],['🍌','банан'],['🍉','арбуз'],['🍇','виноград'],['🍓','клубника'],['🫐','черника'],['🍒','вишня'],['🍑','персик'],['🥭','манго'],['🍍','ананас'],['🥥','кокос'],['🥑','авокадо'],['🍆','баклажан'],['🥕','морковь'],['🌽','кукуруза'],['🌶️','перец острый'],['🍕','пицца'],['🍔','бургер'],['🍟','картошка фри'],['🌭','хот дог'],['🍿','попкорн'],['🧁','кекс'],['🍰','торт'],['🍩','пончик'],['🍪','печенье'],['🍫','шоколад'],['☕','кофе'],['🧋','чай бабл'],['🥤','напиток'],['🍺','пиво'],['🍷','вино'],['🥂','тост']] },
  { id:'activities', label:'Активности', icon:'⚽', items:[['⚽','футбол'],['🏀','баскетбол'],['🏈','американский футбол'],['⚾','бейсбол'],['🎾','теннис'],['🏐','волейбол'],['🎱','бильярд'],['🏓','пинг понг'],['🏸','бадминтон'],['🥊','бокс'],['🥋','карате'],['⛳','гольф'],['🎣','рыбалка'],['🤿','дайвинг'],['🎿','лыжи'],['🏂','сноуборд'],['🏋️','тяжелая атлетика'],['🤸','гимнастика'],['🚴','велосипед'],['🏆','кубок'],['🥇','золото'],['🎮','игра'],['🎲','кости'],['🎯','мишень'],['🎨','рисование'],['🎤','микрофон'],['🎧','наушники'],['🎸','гитара'],['🎹','пианино'],['🎬','кино'],['🎉','вечеринка'],['🎁','подарок']] },
  { id:'travel', label:'Путешествия', icon:'🚗', items:[['🚗','машина'],['🚕','такси'],['🚌','автобус'],['🚎','троллейбус'],['🏎️','гонки'],['🚓','полиция'],['🚑','скорая'],['🚒','пожарная'],['🚲','велосипед'],['🛵','скутер'],['🚂','поезд'],['✈️','самолет'],['🚀','ракета'],['🛸','нло'],['🚁','вертолет'],['⛵','парусник'],['🚢','корабль'],['🏠','дом'],['🏢','здание'],['🏰','замок'],['🗽','статуя свободы'],['🗼','башня'],['🌋','вулкан'],['🏖️','пляж'],['🏕️','кемпинг'],['🌅','рассвет'],['🌈','радуга'],['🌍','земля'],['🌙','луна'],['⭐','звезда'],['☀️','солнце'],['❄️','снег']] },
  { id:'objects', label:'Предметы', icon:'💡', items:[['💡','лампочка идея'],['🔦','фонарь'],['🕯️','свеча'],['🧯','огнетушитель'],['🔧','ключ инструмент'],['🔨','молоток'],['⚙️','шестеренка'],['🧲','магнит'],['🪛','отвертка'],['💎','алмаз'],['🔮','шар'],['🧸','медведь игрушка'],['🪄','волшебная палочка'],['🎈','шарик'],['🎀','бант'],['🧧','конверт'],['📱','телефон'],['💻','ноутбук'],['⌚','часы'],['📷','камера'],['🎥','видеокамера'],['📚','книги'],['✏️','карандаш'],['📝','заметка'],['📌','булавка'],['🔑','ключ'],['🔒','замок'],['🛠️','инструменты'],['🧪','пробирка'],['🧬','днк'],['🩺','стетоскоп'],['💊','таблетка']] },
  { id:'symbols', label:'Символы', icon:'❤️', items:[['❤️','сердце'],['🧡','оранжевое сердце'],['💛','желтое сердце'],['💚','зеленое сердце'],['💙','синее сердце'],['💜','фиолетовое сердце'],['🖤','черное сердце'],['🤍','белое сердце'],['💔','разбитое сердце'],['💕','два сердца'],['💞','вращение сердец'],['💯','сто'],['💢','злость'],['💥','взрыв'],['💫','звездочки'],['💦','капли'],['💨','ветер'],['🕳️','дыра'],['💬','сообщение'],['👁️‍🗨️','глаз речь'],['✅','галочка'],['❌','крестик'],['❓','вопрос'],['❗','восклицание'],['⚠️','внимание'],['♻️','переработка'],['🔞','18'],['©️','копирайт'],['™️','торговая марка'],['🔴','красный круг'],['🟢','зеленый круг'],['🔵','синий круг']] }
];
let session = readSession();
let pinnedChatIds = new Set(readPinnedChatIds());
let accountSettings = null;
let telegramId = null;
let deviceCheckTimer;
let activeGift = null;
let photoViewerItems = [];
let photoViewerIndex = 0;
let photoViewerTouchStart = null;
let pendingPhotos = [];
let pendingPhotoConversationId = null;
let chats = [];
let activeId = null;
let activeFilter = 'all';
let searchUsers = false;
let searchTimer;
let pendingChallenge = null;
let authFlowUsername = '';
let pendingSignupPassword = '';
let refreshing = false;
let chatsLoadedOnce = false;
let chatListRevision = 0;
let chatListRequestId = 0;
const chatHistoryVersions = new Map();
let typingTimer;
let replyToMessageId = null;
let longPressTimer;
let longPressStart = null;
let suppressMessageClick = false;
let chatLongPressTimer;
let chatLongPressStart = null;
let suppressChatClick = false;
let managedBots = [];
let selectedManagedBot = null;
let selectedBotChat = null;
let managedBotSettings = null;
let pendingBotAvatarBase64 = '';
let removeBotAvatar = false;
let botRefreshTimer;
let botRefreshing = false;
let currentProfile = null;
let dialogResolver = null;
let activeEmojiCategory = 'smileys';
let fontScaleRulesApplied = false;
let chatBackgroundDbPromise = null;
const chatBackgroundUrls = new Map();

function readSession() {
  try {
    return JSON.parse(localStorage.getItem('ferniex_messenger_session'));
  } catch {
    return null;
  }
}

function readPinnedChatIds() {
  if (!session?.userId) return [];
  try {
    const pinned = JSON.parse(localStorage.getItem(`ferniex_messenger_pins_${session.userId}`) || '[]');
    return Array.isArray(pinned) ? pinned.map(String) : [];
  } catch {
    return [];
  }
}

function saveSession(data) {
  session = {
    sessionToken: data.sessionToken,
    userId: String(data.userId),
    username: data.username,
    displayName: data.displayName || data.username,
    role: data.role || 'user',
    deviceId: session?.deviceId || crypto.randomUUID()
  };
  pinnedChatIds = new Set(readPinnedChatIds());
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

function renderAuthCode() {
  const value = authCodeInput.value;
  authCodeSlots.forEach((slot, index) => {
    slot.textContent = value[index] || '';
    slot.classList.toggle('active', index === Math.min(value.length, authCodeSlots.length - 1));
    slot.classList.remove('valid', 'invalid');
  });
  authCodeBoxes.classList.remove('shake');
}

async function animateAuthCode(valid) {
  authCodeBoxes.classList.remove('shake');
  authCodeSlots.forEach(slot => slot.classList.remove('valid', 'invalid'));
  for (const slot of authCodeSlots) {
    slot.classList.add(valid ? 'valid' : 'invalid');
    await new Promise(resolve => setTimeout(resolve, 85));
  }
  if (!valid) {
    authCodeBoxes.classList.add('shake');
    await new Promise(resolve => setTimeout(resolve, 430));
    authCodeBoxes.classList.remove('shake');
  }
}

function showAuth(message = '') {
  document.body.classList.add('auth-locked');
  authScreen.classList.remove('is-hidden');
  authFlowUsername = '';
  pendingSignupPassword = '';
  pendingChallenge = null;
  nicknameForm.reset();
  loginForm.reset();
  signupPasswordForm.reset();
  displayNameForm.reset();
  verifyForm.reset();
  renderAuthCode();
  showAuthStep(nicknameForm, 'Ваше пространство для общения', 'FernieID NickName', 'Введите свой NickName, чтобы войти или создать аккаунт.', 'authUsername');
  setAuthError(message);
}

function showAuthStep(form, kicker, title, copy, focusId) {
  document.querySelectorAll('.auth-step').forEach(step => step.classList.add('auth-hidden'));
  form.classList.remove('auth-hidden');
  document.getElementById('authKicker').textContent = kicker;
  document.getElementById('authTitle').textContent = title;
  document.getElementById('authCopy').textContent = copy;
  setAuthError();
  if (focusId) document.getElementById(focusId).focus();
}

function setBusy(form, busy, label) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = busy;
  button.textContent = busy ? `${label}…` : label;
}

function unlock(data) {
  saveSession(data);
  pendingChallenge = null;
  document.body.classList.remove('auth-locked');
  authScreen.classList.add('is-hidden');
  document.getElementById('authPassword').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupPasswordConfirm').value = '';
  pendingSignupPassword = '';
  authCodeInput.value = '';
  renderAuthCode();
  updateAccountMenu();
  registerDevice().catch(() => {}).finally(() => {
    pageLoader.classList.add('hidden');
    loadChats();
    loadSettings().then(loadProducts);
    loadOwnProfile();
    startDeviceChecks();
  });
}

function updateAccountMenu() {
  document.getElementById('drawerName').textContent = session?.displayName || session?.username || 'FernieID';
  document.getElementById('drawerHandle').textContent = session?.username ? `@${session.username}` : 'Ваш аккаунт';
  setAvatar(document.getElementById('drawerAvatar'), { ...session, display_name: session?.displayName });
  const drawerBanner = document.getElementById('drawerBannerImage');
  const drawerCover = drawerBanner.closest('.drawer-cover');
  const bannerUrl = safeImageUrl(session?.banner_url || session?.bannerUrl);
  drawerBanner.hidden = !bannerUrl;
  drawerCover.classList.toggle('has-banner', Boolean(bannerUrl));
  drawerBanner.onerror = () => {
    drawerBanner.hidden = true;
    drawerCover.classList.remove('has-banner');
  };
  if (bannerUrl && drawerBanner.src !== bannerUrl) drawerBanner.src = bannerUrl;
  document.getElementById('accountProfileName').textContent = session?.displayName || session?.username || '—';
  document.getElementById('accountProfileId').textContent = session?.userId ? `ID ${session.userId}` : 'FernieID';
  setAvatar(document.getElementById('accountProfileAvatar'), { ...session, display_name: session?.displayName });
}

function showDialog({ title, message, input = false, value = '', confirmLabel = 'Продолжить', danger = false }) {
  const inputElement = document.getElementById('appDialogInput');
  document.getElementById('appDialogTitle').textContent = title;
  document.getElementById('appDialogMessage').textContent = message;
  document.getElementById('appDialogConfirm').textContent = confirmLabel;
  document.getElementById('appDialogConfirm').classList.toggle('danger', danger);
  inputElement.hidden = !input;
  inputElement.value = value;
  appDialog.classList.add('open');
  appDialog.setAttribute('aria-hidden', 'false');
  if (input) inputElement.focus();
  return new Promise(resolve => { dialogResolver = resolve; });
}

function closeDialog(result = null) {
  appDialog.classList.remove('open');
  appDialog.setAttribute('aria-hidden', 'true');
  const resolve = dialogResolver;
  dialogResolver = null;
  resolve?.(result);
}

function confirmAction(message, { title = 'Подтвердите действие', danger = false } = {}) {
  return showDialog({ title, message, confirmLabel: 'Подтвердить', danger }).then(Boolean);
}

function promptAction(message, value = '') {
  return showDialog({ title: 'Поиск в переписке', message, input: true, value, confirmLabel: 'Найти' });
}

function applyFontScaleRules(rules) {
  for (const rule of rules) {
    if (rule.style) {
      const size = rule.style.getPropertyValue('font-size');
      if (size && !size.includes('--font-scale')) {
        rule.style.setProperty('font-size', `calc(${size} * var(--font-scale, 1))`, rule.style.getPropertyPriority('font-size'));
      }
    }
    if (rule.cssRules) applyFontScaleRules(rule.cssRules);
  }
}

function applyTextScale(value = 100) {
  if (!fontScaleRulesApplied) {
    for (const sheet of document.styleSheets) {
      try {
        applyFontScaleRules(sheet.cssRules);
      } catch {}
    }
    fontScaleRulesApplied = true;
  }
  document.body.style.setProperty('--font-scale', String(Number(value) / 100));
}

function hidePageLoader() {
  pageLoader.classList.add('hidden');
}

function applyPersonalization(settings = accountSettings) {
  const theme = settings?.theme || (localStorage.getItem('ferniex_messenger_dark') === 'true' ? 'dark' : 'light');
  document.body.dataset.theme = theme;
  document.body.classList.toggle('dark-theme', ['dark', 'midnight'].includes(theme));
  if (settings?.accent_color) document.body.style.setProperty('--accent', settings.accent_color);
  applyTextScale(settings?.font_scale || 100);
  document.getElementById('themeState').textContent = ['dark', 'midnight'].includes(theme) ? 'Вкл.' : 'Выкл.';
}

function openChatBackgroundDatabase() {
  if (!chatBackgroundDbPromise) {
    chatBackgroundDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('qwant-messenger-local', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('chat-backgrounds');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return chatBackgroundDbPromise;
}

async function getChatBackground(key) {
  const database = await openChatBackgroundDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction('chat-backgrounds').objectStore('chat-backgrounds').get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function storeChatBackground(key, blob) {
  const database = await openChatBackgroundDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('chat-backgrounds', 'readwrite');
    transaction.objectStore('chat-backgrounds').put(blob, key);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Не удалось сохранить фон'));
  });
}

async function deleteChatBackground(key) {
  const database = await openChatBackgroundDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('chat-backgrounds', 'readwrite');
    transaction.objectStore('chat-backgrounds').delete(key);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Не удалось убрать фон'));
  });
}

function chatBackgroundKey(chatId) {
  return `${session?.userId || 'guest'}:${chatId}`;
}

async function applyChatBackground(chatId) {
  const preview = document.getElementById('chatWallpaperPreview');
  const removeButton = document.getElementById('removeChatWallpaper');
  messages.classList.remove('has-chat-wallpaper');
  messages.style.removeProperty('--chat-wallpaper');
  preview.style.removeProperty('background-image');
  preview.classList.remove('has-image');
  preview.textContent = 'Фон по умолчанию';
  removeButton.hidden = true;
  if (!chatId) return;
  try {
    const key = chatBackgroundKey(chatId);
    let url = chatBackgroundUrls.get(key);
    if (!url) {
      const blob = await getChatBackground(key);
      if (!blob) return;
      url = URL.createObjectURL(blob);
      chatBackgroundUrls.set(key, url);
    }
    if (String(activeId) !== String(chatId)) return;
    messages.style.setProperty('--chat-wallpaper', `url("${url}")`);
    messages.classList.add('has-chat-wallpaper');
    preview.style.backgroundImage = `url("${url}")`;
    preview.classList.add('has-image');
    preview.textContent = 'Свой фон';
    removeButton.hidden = false;
  } catch (error) {
    document.getElementById('chatWallpaperStatus').textContent = error.message || 'Не удалось загрузить фон чата';
  }
}

async function compressChatBackground(file) {
  if (!file.type.startsWith('image/')) throw new Error('Выберите файл изображения.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Размер изображения не должен превышать 12 МБ.');
  const bitmap = await createImageBitmap(file);
  try {
    for (const [maxSize, quality] of [[1440, .76], [1120, .64], [880, .52]]) {
      const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= 650 * 1024) return blob;
    }
  } finally {
    bitmap.close();
  }
  throw new Error('Не удалось сжать фон до допустимого размера.');
}

async function chooseChatBackground(file) {
  const chatId = activeId;
  if (!chatId || !file) return;
  const status = document.getElementById('chatWallpaperStatus');
  status.textContent = 'Подготавливаем фон…';
  try {
    const blob = await compressChatBackground(file);
    const key = chatBackgroundKey(chatId);
    await storeChatBackground(key, blob);
    const oldUrl = chatBackgroundUrls.get(key);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    chatBackgroundUrls.set(key, URL.createObjectURL(blob));
    if (String(activeId) === String(chatId)) await applyChatBackground(chatId);
    status.textContent = 'Фон сохранён для этого чата.';
  } catch (error) {
    status.textContent = error.message || 'Не удалось сохранить фон';
  }
}

async function removeChatBackground() {
  if (!activeId) return;
  const key = chatBackgroundKey(activeId);
  try {
    await deleteChatBackground(key);
    const url = chatBackgroundUrls.get(key);
    if (url) URL.revokeObjectURL(url);
    chatBackgroundUrls.delete(key);
    await applyChatBackground(activeId);
    document.getElementById('chatWallpaperStatus').textContent = 'Установлен стандартный фон.';
  } catch (error) {
    document.getElementById('chatWallpaperStatus').textContent = error.message || 'Не удалось убрать фон';
  }
}

function createDeviceId() {
  return crypto.randomUUID();
}

async function registerDevice() {
  if (!session?.sessionToken) return;
  session.deviceId ||= createDeviceId();
  localStorage.setItem('ferniex_messenger_session', JSON.stringify(session));
  let deviceModel = '';
  try {
    deviceModel = (await navigator.userAgentData?.getHighEntropyValues(['model']))?.model || '';
  } catch {}
  await api('/api/qwant/devices/register', { method: 'POST', body: JSON.stringify({ deviceId: session.deviceId, deviceModel }) });
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
  deviceCheckTimer = setInterval(() => {
    if (!document.hidden) checkDeviceSession();
  }, 30000);
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
      <article class="device-card"><div class="device-head"><div><div class="device-title">${escapeHtml(device.device_name || 'Устройство')}</div>${device.browser_name ? `<div class="device-meta">${escapeHtml(device.browser_name)}</div>` : ''}<div class="device-meta device-location">${escapeHtml([device.city, device.country].filter(Boolean).join(', ') || 'Местоположение недоступно')}</div><div class="device-meta">${device.device_id === session.deviceId ? '<span class="device-current">Это устройство</span><br>' : ''}Последняя активность: ${escapeHtml(formatDateTime(device.last_seen_at))}</div></div>${device.device_id === session.deviceId ? '' : `<button class="settings-button danger" data-revoke-device="${escapeHtml(device.device_id)}" type="button">Завершить</button>`}</div></article>`).join('') : '<div class="settings-note">Активных устройств не найдено.</div>';
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
  document.getElementById('settingsContent').scrollTop = 0;
  await loadSettings();
  if (page === 'devices') loadDevices();
  if (page === 'plus' || page === 'coins') loadProducts();
}

function showSettingsPage(page) {
  document.querySelectorAll('[data-settings-page]').forEach(button => button.classList.toggle('active', button.dataset.settingsPage === page));
  document.querySelectorAll('[data-settings-content]').forEach(section => section.classList.toggle('active', section.dataset.settingsContent === page));
  const label = document.querySelector(`[data-settings-page="${page}"]`)?.textContent.replace(/[♧▣◈✳✦◉]/g, '').trim() || 'Настройки';
  document.getElementById('settingsTitle').textContent = window.matchMedia('(max-width: 760px)').matches ? label : `Настройки Qwant · ${label}`;
}

function closeSettings() {
  settingsOverlay.classList.remove('open');
  settingsOverlay.setAttribute('aria-hidden', 'true');
}

function setBotStatus(message = '') {
  document.getElementById('botManagerStatus').textContent = message;
}

function renderManagedBots() {
  const list = document.getElementById('botList');
  list.innerHTML = managedBots.length ? managedBots.map(bot => `
    <button class="bot-row" type="button" data-managed-bot="${escapeHtml(bot.id)}"><strong>${escapeHtml(bot.display_name)}</strong><small>@${escapeHtml(bot.username)} · токен ${escapeHtml(bot.token_prefix)}…</small></button>`).join('') : '<div class="bot-empty">У вас пока нет ботов.</div>';
  list.querySelectorAll('[data-managed-bot]').forEach(button => button.addEventListener('click', () => {
    const bot = managedBots.find(item => item.id === button.dataset.managedBot);
    if (bot) openManagedBot(bot);
  }));
}

async function loadManagedBots() {
  const list = document.getElementById('botList');
  list.innerHTML = '<div class="bot-empty">Загружаем ботов…</div>';
  try {
    const result = await api('/api/qwant/bots');
    managedBots = result.bots;
    renderManagedBots();
  } catch (error) {
    list.innerHTML = `<div class="bot-empty">${escapeHtml(error.message)}</div>`;
  }
}

function openBotManager() {
  closeDrawer();
  const manager = document.getElementById('botManager');
  manager.classList.add('open');
  manager.setAttribute('aria-hidden', 'false');
  document.getElementById('botTokenNotice').hidden = true;
  selectedManagedBot = null;
  selectedBotChat = null;
  document.getElementById('botListPanel').classList.remove('hidden', 'is-leaving');
  document.getElementById('botInboxPanel').classList.remove('active', 'hidden', 'is-leaving');
  document.getElementById('botThreadPanel').classList.remove('active', 'hidden', 'is-leaving');
  loadManagedBots();
  clearInterval(botRefreshTimer);
  botRefreshTimer = setInterval(() => {
    if (selectedManagedBot && document.getElementById('botManager').classList.contains('open')) loadManagedBotInbox();
  }, 7000);
}

function closeBotManager() {
  document.getElementById('botManager').classList.remove('open');
  document.getElementById('botManager').setAttribute('aria-hidden', 'true');
  closeBotSettings();
  clearInterval(botRefreshTimer);
}

function closeBotSettings() {
  const overlay = document.getElementById('botSettingsOverlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('managedBotToken').value = '';
  document.getElementById('managedBotToken').type = 'password';
  document.getElementById('botTokenVisibility').textContent = 'Показать';
  managedBotSettings = null;
  pendingBotAvatarBase64 = '';
  removeBotAvatar = false;
}

function showBotSettingsPage(page) {
  document.querySelectorAll('[data-bot-settings-page]').forEach(button => button.classList.toggle('active', button.dataset.botSettingsPage === page));
  document.querySelectorAll('[data-bot-settings-content]').forEach(section => {
    if (section.dataset.botSettingsContent === page) {
      section.classList.remove('is-leaving');
      section.classList.add('active');
      return;
    }
    if (!section.classList.contains('active')) return;
    section.classList.add('is-leaving');
    setTimeout(() => {
      if (section.classList.contains('is-leaving')) section.classList.remove('active', 'is-leaving');
    }, 170);
  });
}

function showBotPanel(panel) {
  panel.classList.remove('hidden', 'is-leaving');
  panel.classList.add('active');
}

function hideBotPanel(panel) {
  if (panel.classList.contains('hidden') || panel.classList.contains('is-leaving')) return;
  panel.classList.add('is-leaving');
  setTimeout(() => {
    if (!panel.classList.contains('is-leaving')) return;
    panel.classList.remove('active', 'is-leaving');
    panel.classList.add('hidden');
  }, 190);
}

function renderBotAvatar(url = '') {
  const preview = document.getElementById('botAvatarPreview');
  const imageUrl = String(url).startsWith('data:image/') ? url : safeImageUrl(url);
  preview.replaceChildren();
  if (imageUrl) {
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    preview.append(image);
  } else {
    preview.textContent = initials(managedBotSettings?.display_name || selectedManagedBot?.display_name || 'Q');
  }
}

async function openBotSettings() {
  if (!selectedManagedBot) return;
  const botId = selectedManagedBot.id;
  managedBotSettings = {};
  const overlay = document.getElementById('botSettingsOverlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.getElementById('botSettingsTitle').textContent = `Настройки @${selectedManagedBot.username}`;
  document.getElementById('botDataStatus').textContent = 'Загружаем данные…';
  document.getElementById('botAppearanceStatus').textContent = '';
  document.getElementById('botDeleteStatus').textContent = '';
  showBotSettingsPage('data');
  try {
    const result = await api(`/api/qwant/bots/${encodeURIComponent(botId)}/settings`);
    if (!overlay.classList.contains('open') || selectedManagedBot?.id !== botId) return;
    managedBotSettings = result.bot;
    const tokenInput = document.getElementById('managedBotToken');
    tokenInput.value = result.bot.token || '';
    document.getElementById('botManagedTokenCopy').disabled = !result.bot.token;
    document.getElementById('botDataStatus').textContent = result.bot.token
      ? 'Токен хранится в зашифрованном виде.'
      : 'Этот токен создан до обновления. Перевыпустите его, чтобы получить новый.';
    document.getElementById('botAppearanceName').value = result.bot.display_name || '';
    document.getElementById('botAppearanceDescription').value = result.bot.description || '';
    document.getElementById('botAvatarInput').value = '';
    renderBotAvatar(result.bot.avatar_url || '');
  } catch (error) {
    document.getElementById('botDataStatus').textContent = error.message;
  }
}

async function rotateManagedBotToken() {
  if (!selectedManagedBot) return;
  const button = document.getElementById('botRotateToken');
  button.disabled = true;
  document.getElementById('botDataStatus').textContent = 'Перевыпускаем токен…';
  try {
    const result = await api(`/api/qwant/bots/${encodeURIComponent(selectedManagedBot.id)}/rotate-token`, { method:'POST' });
    managedBotSettings.token = result.token;
    managedBotSettings.token_prefix = result.token_prefix;
    document.getElementById('managedBotToken').value = result.token;
    document.getElementById('botManagedTokenCopy').disabled = false;
    document.getElementById('botDataStatus').textContent = 'Токен перевыпущен. Предыдущий токен больше не работает.';
    await loadManagedBots();
  } catch (error) {
    document.getElementById('botDataStatus').textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function saveManagedBotAppearance(event) {
  event.preventDefault();
  if (!selectedManagedBot) return;
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  document.getElementById('botAppearanceStatus').textContent = 'Сохраняем оформление…';
  try {
    const result = await api(`/api/qwant/bots/${encodeURIComponent(selectedManagedBot.id)}/settings`, {
      method:'PATCH',
      body:JSON.stringify({
        displayName:document.getElementById('botAppearanceName').value.trim(),
        description:document.getElementById('botAppearanceDescription').value.trim(),
        ...(pendingBotAvatarBase64 ? { avatarBase64:pendingBotAvatarBase64 } : {}),
        ...(removeBotAvatar ? { removeAvatar:true } : {})
      })
    });
    managedBotSettings.display_name = document.getElementById('botAppearanceName').value.trim();
    managedBotSettings.description = document.getElementById('botAppearanceDescription').value.trim();
    if (pendingBotAvatarBase64 || removeBotAvatar) managedBotSettings.avatar_url = result.bot.avatar_url || null;
    selectedManagedBot.display_name = managedBotSettings.display_name;
    document.getElementById('botInboxTitle').textContent = `@${selectedManagedBot.username} · Входящие`;
    pendingBotAvatarBase64 = '';
    removeBotAvatar = false;
    document.getElementById('botAvatarInput').value = '';
    renderBotAvatar(managedBotSettings.avatar_url || '');
    document.getElementById('botAppearanceStatus').textContent = 'Оформление сохранено.';
    await loadManagedBots();
  } catch (error) {
    document.getElementById('botAppearanceStatus').textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function deleteManagedBot() {
  if (!selectedManagedBot) return;
  if (!await confirmAction(`Удалить @${selectedManagedBot.username}? Это действие нельзя отменить.`, { title: 'Удалить бота', danger: true })) return;
  const button = document.getElementById('botDeleteButton');
  button.disabled = true;
  document.getElementById('botDeleteStatus').textContent = 'Удаляем бота…';
  try {
    await api(`/api/qwant/bots/${encodeURIComponent(selectedManagedBot.id)}`, { method:'DELETE' });
    closeBotSettings();
    selectedManagedBot = null;
    selectedBotChat = null;
    hideBotPanel(document.getElementById('botInboxPanel'));
    hideBotPanel(document.getElementById('botThreadPanel'));
    document.getElementById('botListPanel').classList.remove('hidden', 'is-leaving');
    if (window.matchMedia('(max-width: 700px)').matches) document.getElementById('botListPanel').classList.add('active');
    setBotStatus('Бот удален. В существующих переписках он отображается как удаленный аккаунт.');
    await loadManagedBots();
  } catch (error) {
    document.getElementById('botDeleteStatus').textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function openManagedBot(bot) {
  selectedManagedBot = bot;
  selectedBotChat = null;
  const mobile = window.matchMedia('(max-width: 700px)').matches;
  showBotPanel(document.getElementById('botInboxPanel'));
  hideBotPanel(document.getElementById('botThreadPanel'));
  if (mobile) hideBotPanel(document.getElementById('botListPanel'));
  else document.getElementById('botListPanel').classList.remove('active');
  document.getElementById('botInboxTitle').textContent = `@${bot.username} · Входящие`;
  await loadManagedBotInbox();
}

async function loadManagedBotInbox() {
  if (!selectedManagedBot || botRefreshing) return;
  botRefreshing = true;
  try {
    const result = await api(`/api/qwant/bots/${encodeURIComponent(selectedManagedBot.id)}/inbox`);
    const inbox = document.getElementById('botInbox');
    inbox.innerHTML = result.chats.length ? result.chats.map(chat => `
      <button class="bot-inbox-row" type="button" data-bot-chat="${escapeHtml(chat.id)}"><strong>${escapeHtml(chat.partner.display_name || chat.partner.username)}</strong><small>@${escapeHtml(chat.partner.username)} · ${escapeHtml(chat.lastMessage || 'Новое сообщение')}${chat.unreadCount ? ` · ${chat.unreadCount} новых` : ''}</small></button>`).join('') : '<div class="bot-empty">Сообщений пока нет. Пользователи могут найти бота по username и написать ему.</div>';
    inbox.querySelectorAll('[data-bot-chat]').forEach(button => button.addEventListener('click', () => {
      const chat = result.chats.find(item => item.id === button.dataset.botChat);
      if (chat) openManagedBotChat(chat);
    }));
    if (selectedBotChat) {
      const updatedChat = result.chats.find(chat => chat.id === selectedBotChat.id);
      if (updatedChat) selectedBotChat = updatedChat;
      await loadManagedBotMessages();
    }
  } catch (error) {
    document.getElementById('botInbox').innerHTML = `<div class="bot-empty">${escapeHtml(error.message)}</div>`;
  } finally {
    botRefreshing = false;
  }
}

async function openManagedBotChat(chat) {
  selectedBotChat = chat;
  document.getElementById('botThreadTitle').textContent = chat.partner.display_name || chat.partner.username;
  showBotPanel(document.getElementById('botThreadPanel'));
  if (window.matchMedia('(max-width: 700px)').matches) hideBotPanel(document.getElementById('botInboxPanel'));
  await loadManagedBotMessages();
}

async function loadManagedBotMessages() {
  if (!selectedManagedBot || !selectedBotChat) return;
  try {
    const result = await api(`/api/qwant/bots/${encodeURIComponent(selectedManagedBot.id)}/chats/${encodeURIComponent(selectedBotChat.id)}/messages`);
    const thread = document.getElementById('botThreadMessages');
    thread.innerHTML = result.messages.length ? result.messages.map(message => `
      <article class="bot-message ${String(message.sender_id) === String(selectedManagedBot.user_id) ? 'own' : ''}">${escapeHtml(message.deleted_at ? 'Сообщение удалено' : message.body)}<small>${escapeHtml(formatTime(message.created_at))}</small></article>`).join('') : '<div class="bot-empty">Сообщений пока нет.</div>';
    thread.scrollTop = thread.scrollHeight;
  } catch (error) {
    document.getElementById('botThreadMessages').innerHTML = `<div class="bot-empty">${escapeHtml(error.message)}</div>`;
  }
}

function openDrawer() {
  drawerBackdrop.classList.add('open');
  drawerBackdrop.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawerBackdrop.classList.remove('open');
  drawerBackdrop.setAttribute('aria-hidden', 'true');
}

function setMobileTabActive(tab) {
  const nav = document.getElementById('mobileTabBar');
  const buttons = [...nav.querySelectorAll('[data-mobile-tab]')];
  const nextIndex = buttons.indexOf(tab);
  if (nextIndex < 0) return;
  const currentIndex = Number(nav.dataset.activeIndex ?? 1);
  nav.style.setProperty('--tab-offset', `${nextIndex * 100}%`);
  nav.dataset.activeIndex = nextIndex;
  nav.classList.remove('slide-left', 'slide-right');
  if (nextIndex !== currentIndex) {
    nav.classList.add(nextIndex < currentIndex ? 'slide-left' : 'slide-right');
    clearTimeout(nav.animationTimer);
    nav.animationTimer = setTimeout(() => nav.classList.remove('slide-left', 'slide-right'), 380);
  }
  buttons.forEach(button => button.classList.toggle('active', button === tab));
}

async function loadOwnProfile() {
  const userId = session?.userId;
  if (!userId) return null;
  try {
    const result = await api(`/api/social/profile/${encodeURIComponent(userId)}?viewerId=${encodeURIComponent(userId)}`);
    if (!result.user || !session || String(session.userId) !== String(userId)) return null;
    session.avatar_url = result.user.avatar_url || null;
    session.banner_url = result.user.banner_url || null;
    session.displayName = result.user.display_name || session.displayName || session.username;
    localStorage.setItem('ferniex_messenger_session', JSON.stringify(session));
    updateAccountMenu();
    return result.user;
  } catch {
    return null;
  }
}

async function openProfile(person = null) {
  const userId = person?.id || session?.userId;
  currentProfile = { ...(person || {}), id: userId, username: person?.username || session?.username, display_name: person?.display_name || session?.displayName };
  profileScreen.classList.add('open');
  profileScreen.setAttribute('aria-hidden', 'false');
  document.body.classList.add('profile-open');
  renderProfile(currentProfile, !person);
  if (!userId || currentProfile.is_deleted) return;
  try {
    const result = person
      ? await api(`/api/social/profile/${encodeURIComponent(userId)}?viewerId=${encodeURIComponent(session?.userId || '')}`)
      : { user: await loadOwnProfile() };
    if (result.user && String(currentProfile.id) === String(userId)) {
      currentProfile = { ...currentProfile, ...result.user };
      if (!person) {
        updateAccountMenu();
      }
      renderProfile(currentProfile, !person);
    }
  } catch (error) {
    showMessageToast(error.message || 'Не удалось загрузить профиль FernieID');
  }
}

function renderProfile(person, own) {
  const displayName = person.display_name || person.username || 'FernieID';
  document.getElementById('profileTitle').textContent = own ? 'Мой профиль' : 'Профиль';
  document.getElementById('accountProfileName').textContent = displayName;
  document.getElementById('accountProfileId').textContent = person.id ? `ID ${person.id}` : 'FernieID';
  document.getElementById('profileUsername').textContent = person.username ? `@${person.username}` : (person.is_deleted ? 'Аккаунт удалён' : 'NickName не указан');
  const description = document.getElementById('accountProfileDescription');
  description.textContent = person.description || '';
  description.hidden = !person.description;
  const banner = document.getElementById('profileBannerImage');
  const bannerUrl = safeImageUrl(person.banner_url || person.bannerUrl);
  banner.src = bannerUrl;
  banner.hidden = !bannerUrl;
  banner.onerror = () => {
    banner.hidden = true;
    document.getElementById('profileBanner').classList.remove('has-banner');
  };
  document.getElementById('profileBanner').classList.toggle('has-banner', !!bannerUrl);
  const displayNameForm = document.getElementById('accountDisplayNameForm');
  displayNameForm.hidden = !own;
  document.getElementById('accountDisplayNameInput').value = session?.displayName || session?.username || '';
  document.getElementById('accountDisplayNameStatus').textContent = '';
  setAvatar(document.getElementById('accountProfileAvatar'), person);
}

function closeProfile() {
  profileScreen.classList.remove('open');
  profileScreen.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('profile-open');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function initials(name = '') {
  return String(name).trim().split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase('ru') || 'FX';
}

function avatarMarkup(person, className = 'avatar') {
  const name = person.display_name || person.username || person.name || 'Пользователь';
  const color = colors[Math.abs(Number(String(person.id || name).replace(/\D/g, '').slice(-6)) || name.length) % colors.length];
  if (person.is_deleted) return `<span class="${className} deleted-account" aria-label="Удаленный аккаунт">⊘</span>`;
  const photo = safeImageUrl(person.avatar_url);
  return `<span class="${className}" style="background:${color}">${photo ? `<img src="${escapeHtml(photo)}" alt="">` : escapeHtml(initials(name))}</span>`;
}

function setAvatar(element, person) {
  if (person.is_deleted) {
    element.classList.add('deleted-account');
    element.style.background = '';
    element.replaceChildren();
    element.textContent = '⊘';
    return;
  }
  element.classList.remove('deleted-account');
  const photo = safeImageUrl(person.avatar_url);
  element.style.background = colors[Math.abs(Number(String(person.id || person.username || '').replace(/\D/g, '').slice(-6)) || String(person.username || '').length) % colors.length];
  element.replaceChildren();
  if (photo) {
    const image = document.createElement('img');
    image.src = photo;
    image.alt = '';
    image.onerror = () => {
      element.replaceChildren();
      element.textContent = initials(person.display_name || person.displayName || person.username);
    };
    element.append(image);
  } else {
    element.textContent = initials(person.display_name || person.displayName || person.username);
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
  const name = partner.display_name || partner.username || 'Пользователь';
  return {
    id: row.id,
    partner,
    name,
    handle: partner.is_deleted ? 'Аккаунт удален' : partner.username ? `@${partner.username}` : name,
    initials: initials(name),
    color: colors[Math.abs(Number(String(partner.id || name).replace(/\D/g, '').slice(-6)) || name.length) % colors.length],
    lastMessageAt: row.lastMessageAt,
    time: formatTime(row.lastMessageAt),
    preview: row.lastMessage || 'Начните переписку',
    unread: Number(row.unreadCount) || 0,
    pinned: pinnedChatIds.has(String(row.id)),
    online: false,
    personal: true,
    messages: [],
    messagesLoaded: false
  };
}

function favoritesChatId() {
  return `favorites-${session.userId}`;
}

function favoritesCacheKey() {
  return `ferniex_messenger_favorites_${session.userId}`;
}

function mapFavoriteMessages(rows, chatId = favoritesChatId()) {
  return rows.map(row => ({
    id: String(row.id),
    conversationId: chatId,
    text: row.body,
    imageUrl: '',
    localImage: false,
    type: 'text',
    gift: null,
    replyToMessageId: null,
    replyText: '',
    replySender: '',
    createdAt: row.created_at,
    time: formatTime(row.created_at),
    readAt: row.created_at,
    albumId: '',
    own: true,
    favoriteMessage: true
  }));
}

function readFavoriteMessageCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(favoritesCacheKey()) || '[]');
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function cacheFavoriteMessages(chat) {
  try {
    localStorage.setItem(favoritesCacheKey(), JSON.stringify(chat.messages
      .filter(message => message.favoriteMessage)
      .map(message => ({ id: message.id, body: message.text, created_at: message.createdAt }))));
  } catch {}
}

function createFavoritesChat(previous = null) {
  const id = favoritesChatId();
  const cachedRows = previous?.messagesLoaded ? null : readFavoriteMessageCache();
  const cachedMessages = previous?.messagesLoaded ? previous.messages : mapFavoriteMessages(cachedRows, id);
  const latest = cachedMessages.at(-1);
  return {
    id,
    partner: { ...session, display_name: 'Избранное' },
    name: 'Избранное',
    handle: 'Личные заметки · видны только вам',
    initials: '★',
    color: '#5288e8',
    lastMessageAt: latest?.createdAt || null,
    time: latest?.time || '',
    preview: latest?.text || 'Сохраняйте сообщения и заметки здесь',
    unread: 0,
    pinned: true,
    online: false,
    personal: true,
    isFavorites: true,
    messages: cachedMessages,
    messagesLoaded: true
  };
}

function renderChats() {
  closeChatContextMenu();
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  const filtered = chats.filter(chat => {
    const matchesQuery = `${chat.name} ${chat.preview} ${chat.handle}`.toLocaleLowerCase('ru').includes(query);
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'unread' ? chat.unread > 0 : chat.personal);
    return matchesQuery && matchesFilter;
  }).sort((left, right) => Number(right.isFavorites) - Number(left.isFavorites) || Number(right.pinned) - Number(left.pinned));
  chatList.innerHTML = filtered.length ? filtered.map(chat => `
    <button class="chat-item ${chat.id === activeId ? 'active' : ''}" data-chat="${escapeHtml(chat.id)}">
      <span class="avatar-wrap">${chat.isFavorites ? '<span class="avatar favorites-avatar">★</span>' : avatarMarkup(chat.partner)}${chat.online ? '<span class="online-dot"></span>' : ''}</span>
      <span class="chat-copy"><span class="chat-top"><span class="chat-name">${escapeHtml(chat.name)}</span><span class="chat-time">${chat.pinned ? '<span class="pin" title="Закреплено">⌖</span> ' : ''}${escapeHtml(chat.time)}</span></span><span class="chat-bottom"><span class="chat-preview">${escapeHtml(chat.preview)}</span>${chat.unread ? `<span class="unread">${chat.unread}</span>` : ''}</span></span>
    </button>`).join('') : `<div class="empty-state">${query ? 'Ничего не найдено' : 'Здесь появятся ваши чаты'}</div>`;
  chatList.querySelectorAll('[data-chat]').forEach(button => button.addEventListener('click', () => {
    if (suppressChatClick) {
      suppressChatClick = false;
      return;
    }
    closeChatContextMenu();
    selectChat(button.dataset.chat);
  }));
}

function messageStatusMarkup(message) {
  if (!message.own) return '';
  if (message.sendStatus === 'sending') return '<span class="message-send-status sending" title="Отправляется" aria-label="Отправляется"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span>';
  if (message.sendStatus === 'failed') return `<button class="message-send-status failed" type="button" data-retry-message="${escapeHtml(message.id)}" title="Не отправлено. Нажмите, чтобы повторить" aria-label="Повторить отправку"><svg viewBox="0 0 24 24"><path d="M12 8v5"></path><path d="M12 17h.01"></path></svg></button>`;
  return `<span class="checks">${message.readAt ? '✓✓' : '✓'}</span>`;
}

function photoAlbumAt(list, start) {
  const first = list[start];
  if (!first?.imageUrl) return [first];
  const album = [first];
  for (let index = start + 1; index < list.length && album.length < 4; index += 1) {
    const next = list[index];
    const previous = album[album.length - 1];
    if (!next.imageUrl || next.own !== first.own) break;
    if (first.albumId ? next.albumId !== first.albumId : next.albumId || Math.abs(Date.parse(next.createdAt) - Date.parse(previous.createdAt)) > 120000) break;
    album.push(next);
  }
  return album;
}

function photoAlbumMarkup(chat, album, previousDate = '', animate = false) {
  const first = album[0];
  const latest = album[album.length - 1];
  const day = dateLabel(first.createdAt);
  const datePill = day === previousDate ? '' : `<div class="date-pill">${escapeHtml(day)}</div>`;
  const replyQuote = first.replyText ? `<div class="reply-quote"><b>${escapeHtml(first.replySender || 'Ответ')}</b>${escapeHtml(first.replyText)}</div>` : '';
  const tiles = album.map(message => {
    const image = message.localImage ? message.imageUrl : safeImageUrl(message.imageUrl);
    return `<div class="album-tile" data-message-id="${escapeHtml(message.id)}" role="button" tabindex="0" aria-label="Открыть фото"><img src="${escapeHtml(image)}" alt="Фото из сообщения" loading="lazy"></div>`;
  }).join('');
  const statusMessage = album.find(message => message.sendStatus === 'failed') || album.find(message => message.sendStatus === 'sending') || latest;
  return `${datePill}<div class="message-row ${first.own ? 'own' : ''} ${animate ? 'message-new' : ''}" data-message-id="${escapeHtml(first.id)}">
    ${first.own ? '' : avatarMarkup(chat.partner, 'message-avatar')}
    <article class="bubble album-bubble"><div class="album-grid count-${album.length}">${tiles}</div>${replyQuote}${first.text ? `<div class="album-caption">${escapeHtml(first.text)}</div>` : ''}<div class="bubble-meta"><span>${escapeHtml(latest.time)}</span>${messageStatusMarkup(statusMessage)}</div></article>
  </div>`;
}

function messageMarkup(chat, message, previousDate = '', animate = false) {
  const day = dateLabel(message.createdAt);
  const datePill = day === previousDate ? '' : `<div class="date-pill">${escapeHtml(day)}</div>`;
  const replyQuote = message.replyText ? `<div class="reply-quote"><b>${escapeHtml(message.replySender || 'Ответ')}</b>${escapeHtml(message.replyText)}</div>` : '';
  if (message.type === 'udg_gift') {
    const gift = message.gift || { model_name: 'Подарок UDG', collection_name: 'Детали подарка недоступны' };
    const image = safeImageUrl(gift.image_url);
    const background = safeImageUrl(gift.background_url);
    const backgroundStyle = background ? ` style="background-image:url('${escapeHtml(background)}')"` : '';
    return `${datePill}<div class="message-row ${message.own ? 'own' : ''} gift-message-row ${animate ? 'message-new' : ''}" data-message-id="${escapeHtml(message.id)}">
      ${message.own ? '' : avatarMarkup(chat.partner, 'message-avatar')}
      <article class="bubble gift-message-bubble">
        ${replyQuote}
        <div class="gift-message-label">${message.own ? 'Вы передали подарок' : 'Вам передали подарок'}</div>
        <div class="gift-preview-card">
          <div class="gift-preview-art"${backgroundStyle}>${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(gift.model_name || 'Подарок UDG')}" loading="lazy">` : '<span class="gift-fallback">✧</span>'}<span class="gift-ribbon">ПОДАРОК</span></div>
          <div class="gift-preview-copy">
            <div class="gift-preview-name">${escapeHtml(gift.model_name || gift.gift_id || 'Подарок UDG')}</div>
            <div class="gift-preview-collection">${escapeHtml(gift.collection_name || 'Коллекция UDG')}</div>
            <div class="gift-preview-specs"><div class="gift-preview-spec"><span>Модель</span><b>${escapeHtml(gift.model_name || gift.gift_id || '—')}</b></div><div class="gift-preview-spec"><span>Фон</span><b>${escapeHtml(gift.background_name || '—')}</b></div></div>
            <button class="gift-open-button" type="button" data-gift-open="${escapeHtml(message.id)}">Посмотреть подарок</button>
          </div>
        </div>
        <div class="bubble-meta"><span>${escapeHtml(message.time)}</span>${messageStatusMarkup(message)}</div>
      </article>
    </div>`;
  }
  const image = message.localImage ? message.imageUrl : safeImageUrl(message.imageUrl);
  const text = message.text || (image ? ' ' : 'Сообщение без текста');
  return `${datePill}<div class="message-row ${message.own ? 'own' : ''} ${animate ? 'message-new' : ''}" data-message-id="${escapeHtml(message.id)}">
    ${message.own ? '' : avatarMarkup(chat.partner, 'message-avatar')}
    <div class="bubble">${replyQuote}${image ? `<img class="message-photo" data-view-photo="${escapeHtml(message.id)}" src="${escapeHtml(image)}" alt="Фото из сообщения" loading="lazy">` : ''}${escapeHtml(text)}<div class="bubble-meta"><span>${escapeHtml(message.time)}</span>${messageStatusMarkup(message)}</div></div>
  </div>`;
}

function renderMessages(chat, animateRecent = false) {
  if (!chat.messages.length) {
    messages.innerHTML = '<div class="empty-state">Здесь пока нет сообщений.<br>Напишите первым.</div>';
    return;
  }
  let previousDate = '';
  let index = 0;
  const markup = [];
  while (index < chat.messages.length) {
    const album = photoAlbumAt(chat.messages, index);
    const animate = animateRecent && index >= Math.max(0, chat.messages.length - 8);
    markup.push(album.length > 1
      ? photoAlbumMarkup(chat, album, previousDate, animate)
      : messageMarkup(chat, album[0], previousDate, animate));
    previousDate = dateLabel(album[0].createdAt);
    index += album.length;
  }
  messages.innerHTML = markup.join('');
  messages.scrollTop = messages.scrollHeight;
}

function conversationPhotos(chat) {
  return chat.messages.filter(message => message.imageUrl).map(message => ({
    id:String(message.id),
    url:message.localImage ? message.imageUrl : safeImageUrl(message.imageUrl),
    caption:message.text || '',
    time:message.time || ''
  })).filter(photo => photo.url);
}

function renderPhotoViewer() {
  const photo = photoViewerItems[photoViewerIndex];
  if (!photo) return closePhotoViewer();
  photoViewerImage.src = photo.url;
  photoViewerImage.alt = photo.caption || 'Фото из переписки';
  photoViewerCount.textContent = `${photoViewerIndex + 1} из ${photoViewerItems.length}`;
  photoViewerCaption.textContent = photo.caption || photo.time;
  photoViewerCaption.hidden = !photo.caption && !photo.time;
  photoViewerDownload.href = photo.url;
  photoViewerDownload.download = `qwant-photo-${photoViewerIndex + 1}`;
  document.getElementById('photoViewerPrev').disabled = photoViewerItems.length < 2;
  document.getElementById('photoViewerNext').disabled = photoViewerItems.length < 2;
  photoViewerImage.style.animation = 'none';
  requestAnimationFrame(() => { photoViewerImage.style.animation = ''; });
  const next = photoViewerItems[(photoViewerIndex + 1) % photoViewerItems.length];
  if (next && photoViewerItems.length > 1) {
    const preload = new Image();
    preload.src = next.url;
  }
}

function openPhotoViewer(messageId) {
  const chat = chats.find(item => String(item.id) === String(activeId));
  if (!chat) return;
  photoViewerItems = conversationPhotos(chat);
  photoViewerIndex = photoViewerItems.findIndex(photo => photo.id === String(messageId));
  if (photoViewerIndex < 0) return;
  photoViewer.classList.add('open');
  photoViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('photo-viewer-open');
  renderPhotoViewer();
}

function movePhotoViewer(direction) {
  if (photoViewerItems.length < 2) return;
  photoViewerIndex = (photoViewerIndex + direction + photoViewerItems.length) % photoViewerItems.length;
  renderPhotoViewer();
}

function closePhotoViewer() {
  photoViewer.classList.remove('open');
  photoViewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('photo-viewer-open');
  photoViewerImage.removeAttribute('src');
  photoViewerItems = [];
  photoViewerIndex = 0;
}

function giftDetailRow(label, value) {
  if (value === null || value === undefined || value === '') return '';
  return `<div class="gift-detail-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

function renderGiftDetails(gift) {
  const image = safeImageUrl(gift.image_url);
  const background = safeImageUrl(gift.background_url);
  const backgroundStyle = background ? ` style="background-image:url('${escapeHtml(background)}')"` : '';
  const listed = gift.listed === true;
  const marketPrice = Number(gift.market_price ?? gift.price);
  const listingPrice = Number(gift.listing_price ?? gift.price);
  const rows = [
    giftDetailRow('Коллекция', gift.collection_name || 'UDG'),
    giftDetailRow('Модель', gift.model_name || gift.gift_id || '—'),
    giftDetailRow('Фон', gift.background_name || '—'),
    giftDetailRow('Символ', gift.symbol_name),
    giftDetailRow('UID подарка', gift.uid),
    Number.isFinite(marketPrice) && marketPrice > 0 ? giftDetailRow('Рыночная оценка', `${new Intl.NumberFormat('ru-RU').format(marketPrice)} FC`) : '',
    giftDetailRow('Цена объявления', listed && Number.isFinite(listingPrice) ? `${new Intl.NumberFormat('ru-RU').format(listingPrice)} FC` : 'Не выставлен')
  ].filter(Boolean).join('');
  const imageMarkup = image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(gift.model_name || 'Подарок UDG')}">` : '<span class="gift-fallback">✧</span>';
  document.getElementById('giftModalBody').innerHTML = `
    <div class="gift-modal-art"${backgroundStyle}>${imageMarkup}</div>
    <h2 class="gift-modal-title" id="giftModalTitle">${escapeHtml(gift.model_name || gift.gift_id || 'Подарок UDG')}</h2>
    <p class="gift-modal-subtitle">${escapeHtml(gift.collection_name || 'Коллекция UDG')}</p>
    <div class="gift-detail-table">${rows || '<div class="gift-detail-row"><span>Информация</span><b>Данные подарка сохранены не полностью</b></div>'}</div>
    <p class="gift-market-note">Рыночная оценка может изменяться. Данные показаны на момент передачи подарка.</p>
    <div class="gift-modal-actions"><button class="settings-button" id="giftShareButton" type="button">Поделиться</button><button class="settings-button" id="giftPageButton" type="button" ${gift.uid ? '' : 'disabled'}>Открыть страницу</button></div>`;
  document.getElementById('giftShareButton').addEventListener('click', shareGift);
  document.getElementById('giftPageButton').addEventListener('click', openGiftPage);
}

function openGift(gift) {
  if (!gift) return;
  activeGift = gift;
  renderGiftDetails(gift);
  const modal = document.getElementById('giftModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeGift() {
  const modal = document.getElementById('giftModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  activeGift = null;
}

function giftPageUrl(gift) {
  return `https://ferniex-id.vercel.app/udggift/${encodeURIComponent(gift.uid)}`;
}

async function shareGift() {
  if (!activeGift?.uid) return;
  const url = giftPageUrl(activeGift);
  try {
    if (navigator.share) await navigator.share({ title: activeGift.model_name || 'Подарок UDG', url });
    else {
      await navigator.clipboard.writeText(url);
      document.getElementById('giftShareButton').textContent = 'Ссылка скопирована';
    }
  } catch (error) {
    if (error.name !== 'AbortError') document.getElementById('giftShareButton').textContent = 'Не удалось поделиться';
  }
}

function openGiftPage() {
  if (activeGift?.uid) window.open(giftPageUrl(activeGift), '_blank', 'noopener,noreferrer');
}

function renderPhotoSendPreview() {
  photoSendPreview.replaceChildren();
  for (let start = 0; start < pendingPhotos.length; start += 4) {
    const album = document.createElement('div');
    album.className = `photo-send-album${pendingPhotos.slice(start, start + 4).length === 1 ? ' single' : ''}`;
    pendingPhotos.slice(start, start + 4).forEach((photo, offset) => {
      const index = start + offset;
      const tile = document.createElement('div');
      tile.className = 'photo-send-thumb';
      const image = document.createElement('img');
      image.src = photo.dataUrl;
      image.alt = `Фото ${index + 1}`;
      const remove = document.createElement('button');
      remove.className = 'photo-send-remove';
      remove.type = 'button';
      remove.dataset.removePhoto = String(index);
      remove.setAttribute('aria-label', `Удалить фото ${index + 1}`);
      remove.textContent = '×';
      tile.append(image, remove);
      album.append(tile);
    });
    photoSendPreview.append(album);
  }
  const count = document.createElement('div');
  count.className = 'photo-send-count';
  count.textContent = `${pendingPhotos.length} фото · группы до 4`;
  photoSendPreview.append(count);
  document.getElementById('photoSendTitle').textContent = pendingPhotos.length === 1 ? 'Отправить изображение' : `Отправить ${pendingPhotos.length} фото`;
  document.getElementById('photoSendSubmit').disabled = pendingPhotos.length === 0;
}

function openPhotoSend(images) {
  if (!activeId) return showMessageToast('Сначала выберите чат');
  const isOpen = photoSendModal.classList.contains('open');
  if (!isOpen) {
    pendingPhotos = [];
    pendingPhotoConversationId = activeId;
    photoSendCaption.value = '';
  }
  pendingPhotos.push(...images.map(dataUrl => ({ id: crypto.randomUUID(), dataUrl })));
  renderPhotoSendPreview();
  photoSendModal.classList.add('open');
  photoSendModal.setAttribute('aria-hidden', 'false');
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
    reader.readAsDataURL(file);
  });
}

async function openPhotoFiles(fileList) {
  if (chats.find(chat => chat.id === activeId)?.isFavorites) {
    showMessageToast('Избранное предназначено для личных текстовых заметок');
    return;
  }
  const files = Array.from(fileList || []);
  if (!files.length) return;
  const valid = files.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 8 * 1024 * 1024);
  if (valid.length !== files.length) showMessageToast('Принимаются JPG, PNG и WEBP до 8 МБ каждый.');
  if (!valid.length) return;
  try {
    openPhotoSend(await Promise.all(valid.map(readImageFile)));
  } catch (error) {
    showMessageToast(error.message || 'Не удалось прочитать изображения.');
  }
}

function renderEmojiPicker() {
  emojiCategoriesElement.innerHTML = emojiCategories.map(category => `
    <button class="emoji-picker-category ${category.id === activeEmojiCategory ? 'active' : ''}" type="button" role="tab" aria-label="${escapeHtml(category.label)}" title="${escapeHtml(category.label)}" data-emoji-category="${category.id}">${category.icon}</button>`).join('');
  const query = emojiSearch.value.trim().toLocaleLowerCase('ru');
  const source = query ? emojiCategories.flatMap(category => category.items) : (emojiCategories.find(category => category.id === activeEmojiCategory)?.items || []);
  const results = query ? source.filter(([emoji, keywords]) => `${emoji} ${keywords}`.toLocaleLowerCase('ru').includes(query)) : source;
  emojiGrid.innerHTML = results.map(([emoji, keywords]) => `
    <button class="emoji-picker-item" type="button" role="option" aria-label="${escapeHtml(keywords)}" title="${escapeHtml(keywords)}" data-emoji="${emoji}">${emoji}</button>`).join('') || '<span class="emoji-empty">Ничего не найдено</span>';
}

function setEmojiPickerOpen(open) {
  emojiPicker.classList.toggle('open', open);
  emojiButton.setAttribute('aria-expanded', String(open));
  if (open) renderEmojiPicker();
}

function insertEmoji(emoji) {
  const start = messageInput.selectionStart ?? messageInput.value.length;
  const end = messageInput.selectionEnd ?? start;
  messageInput.setRangeText(emoji, start, end, 'end');
  messageInput.dispatchEvent(new Event('input', { bubbles: true }));
  messageInput.focus();
  setEmojiPickerOpen(false);
}

function closePhotoSend() {
  photoSendModal.classList.remove('open');
  photoSendModal.setAttribute('aria-hidden', 'true');
  photoSendPreview.replaceChildren();
  photoSendCaption.value = '';
  pendingPhotos = [];
  pendingPhotoConversationId = null;
}

function savedPhotoAlbumId(messageId) {
  if (!session?.userId) return '';
  try {
    const albums = JSON.parse(localStorage.getItem(`ferniex_messenger_albums_${session.userId}`) || '{}');
    return albums[String(messageId)] || '';
  } catch {
    return '';
  }
}

function savePhotoAlbumId(messageId, albumId) {
  if (!session?.userId || !messageId || !albumId) return;
  const key = `ferniex_messenger_albums_${session.userId}`;
  let albums = {};
  try {
    albums = JSON.parse(localStorage.getItem(key) || '{}');
  } catch {}
  albums[String(messageId)] = albumId;
  const ids = Object.keys(albums);
  if (ids.length > 1000) ids.slice(0, ids.length - 1000).forEach(id => delete albums[id]);
  try {
    localStorage.setItem(key, JSON.stringify(albums));
  } catch {}
}

function mapMessages(rows) {
  const rowById = new Map(rows.map(row => [String(row.id), row]));
  return rows.map(row => {
    const replied = row.reply_to_message_id ? rowById.get(String(row.reply_to_message_id)) : null;
    const repliedGift = replied?.message_type === 'udg_gift' ? replied.gift_payload?.model_name || 'Подарок UDG' : '';
    const replyText = replied ? (replied.deleted_at ? 'Сообщение удалено' : repliedGift || replied.body || 'Фото') : '';
    return {
    id: row.id,
    text: row.deleted_at ? 'Сообщение удалено' : row.body,
    imageUrl: row.deleted_at ? '' : row.image_url,
    type: row.deleted_at ? 'text' : row.message_type,
    gift: row.deleted_at ? null : row.gift_payload,
    replyToMessageId: row.reply_to_message_id,
    replyText,
    replySender: replied ? (String(replied.sender_id) === String(session.userId) ? 'Вы' : 'Собеседник') : '',
    createdAt: row.created_at,
    time: formatTime(row.created_at),
    readAt: row.read_at,
    albumId: savedPhotoAlbumId(row.id),
    own: String(row.sender_id) === String(session.userId)
    };
  });
}

function mergeLocalMessages(chat, latest) {
  const localMessages = chat.messages.filter(message => message.localMessage && ['sending', 'failed'].includes(message.sendStatus));
  const matched = new Set();
  const remaining = localMessages.filter(local => {
    const index = latest.findIndex((message, itemIndex) => !matched.has(itemIndex)
      && message.own
      && message.text === local.text
      && Boolean(message.imageUrl) === Boolean(local.imageUrl)
      && Math.abs(Date.parse(message.createdAt) - Date.parse(local.createdAt)) < 120000);
    if (index < 0) return true;
    matched.add(index);
    return false;
  });
  return [...latest, ...remaining].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
}

function sameMessage(left, right) {
  return left.id === right.id
    && left.text === right.text
    && left.imageUrl === right.imageUrl
    && left.type === right.type
    && JSON.stringify(left.gift) === JSON.stringify(right.gift)
    && left.readAt === right.readAt
    && left.sendStatus === right.sendStatus
    && left.localImage === right.localImage
    && left.albumId === right.albumId;
}

function updateMessages(chat, latest) {
  const oldMessages = chat.messages;
  latest = mergeLocalMessages(chat, latest);
  if (!chat.messagesLoaded) {
    chat.messages = latest;
    chat.messagesLoaded = true;
    renderMessages(chat);
    return true;
  }
  const canAppend = oldMessages.length > 0 && oldMessages.every((message, index) => {
    const next = latest[index];
    return next && sameMessage(message, next);
  });
  if (canAppend && latest.length > oldMessages.length && !latest.slice(oldMessages.length).some(message => message.imageUrl)) {
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
    return !next || !sameMessage(message, next);
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
  const historyVersion = chatHistoryVersions.get(String(chat.id)) || 0;
  if (showLoader && !chat.messagesLoaded) {
    messages.innerHTML = '<div class="messages-loading"><span class="loading-spinner"></span><span>Загружаем переписку</span><span class="loading-dots"><i></i><i></i><i></i></span></div>';
  }
  try {
    const result = await api(`/api/social/chats/${encodeURIComponent(chat.id)}/messages`);
    if (activeId !== chat.id || historyVersion !== (chatHistoryVersions.get(String(chat.id)) || 0)) return;
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

async function loadFavoriteMessages(chat) {
  try {
    const result = await api('/api/social/favorites/messages');
    const currentChat = chats.find(item => item.id === chat.id);
    if (!currentChat?.isFavorites) return;
    currentChat.messages = mapFavoriteMessages(result.messages, currentChat.id);
    currentChat.messagesLoaded = true;
    const latest = currentChat.messages.at(-1);
    currentChat.lastMessageAt = latest?.createdAt || null;
    currentChat.time = latest?.time || '';
    currentChat.preview = latest?.text || 'Сохраняйте сообщения и заметки здесь';
    cacheFavoriteMessages(currentChat);
    if (activeId === currentChat.id) {
      renderMessages(currentChat);
      renderSharedDetails(currentChat);
    }
    renderChats();
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
  document.getElementById('mediaGrid').innerHTML = media.slice(0, 9).map(item => `<button class="media-tile" type="button" data-view-photo="${escapeHtml(item.id)}" aria-label="Открыть фото"><img src="${escapeHtml(safeImageUrl(item.imageUrl))}" alt="Фото из переписки" loading="lazy"></button>`).join('');
  document.getElementById('mediaEmpty').hidden = media.length > 0;
  document.getElementById('linkCount').textContent = links.length;
  document.getElementById('sharedLinks').innerHTML = links.slice(0, 12).map(link => `<a class="shared-link" href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer"><span class="link-icon"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/></svg></span><span>${escapeHtml(new URL(link.href).hostname)}<br><small style="color:var(--muted)">${escapeHtml(formatTime(link.createdAt))}</small></span></a>`).join('');
  document.getElementById('linksEmpty').hidden = links.length > 0;
}

async function loadChats() {
  if (!session?.sessionToken) return;
  const requestId = ++chatListRequestId;
  const revision = chatListRevision;
  try {
    const result = await api('/api/social/chats');
    if (requestId !== chatListRequestId || revision !== chatListRevision) return;
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
    const pendingChat = chats.find(chat => !chat.isFavorites && chat.id === activeId && !chat.lastMessageAt && !loadedIds.has(chat.id));
    const favoriteChat = createFavoritesChat(previousChats.get(favoritesChatId()));
    chats = [favoriteChat, ...(pendingChat ? [...nextChats, pendingChat] : nextChats)];
    renderChats();
    if (activeId && !chats.some(chat => chat.id === activeId)) {
      activeId = null;
      document.getElementById('chatAppearance').hidden = true;
      applyChatBackground(null);
      document.getElementById('messageForm').hidden = false;
      document.getElementById('deletedChatActions').hidden = true;
      app.classList.remove('show-conversation');
    }
    const firstLoad = !chatsLoadedOnce;
    chatsLoadedOnce = true;
    if (firstLoad && !activeId && chats.length && !window.matchMedia('(max-width: 760px)').matches) {
      const requestedChatId = new URLSearchParams(window.location.search).get('chatId');
      const requestedChat = requestedChatId && chats.find(chat => String(chat.id) === requestedChatId);
      const defaultChat = chats.find(chat => !chat.isFavorites) || chats[0];
      await selectChat(requestedChat?.id || defaultChat.id);
    }
    if (!chats.length) messages.innerHTML = '<div class="empty-state">Начните новую переписку<br>с помощью кнопки +</div>';
  } catch (error) {
    if (requestId !== chatListRequestId || revision !== chatListRevision) return;
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
  if (!chat.isFavorites) {
    chatListRevision += 1;
    api(`/api/social/chats/${encodeURIComponent(chat.id)}/unhide`, { method: 'POST' }).catch(() => {});
  }
  if (activeId !== id) clearReply();
  closeMessageMenu();
  activeId = id;
  document.querySelector('.conversation').classList.toggle('favorites-chat', chat.isFavorites);
  document.getElementById('chatAppearance').hidden = false;
  document.getElementById('chatWallpaperStatus').textContent = '';
  applyChatBackground(id);
  chat.unread = 0;
  setAvatar(document.getElementById('headerAvatar'), chat.partner);
  document.getElementById('headerName').textContent = chat.name;
  document.getElementById('headerStatus').textContent = chat.handle;
  document.getElementById('messageForm').hidden = !!chat.partner.is_deleted;
  document.getElementById('deletedChatActions').hidden = !chat.partner.is_deleted;
  document.getElementById('attachButton').hidden = chat.isFavorites;
  messageInput.placeholder = chat.isFavorites ? 'Сообщение для себя…' : 'Написать сообщение…';
  document.getElementById('deleteDeletedChatStatus').textContent = '';
  setAvatar(document.getElementById('detailAvatar'), chat.partner);
  document.getElementById('detailName').textContent = chat.name;
  document.getElementById('detailHandle').textContent = chat.handle;
  const description = document.getElementById('detailDescription');
  description.textContent = chat.partner.description || '';
  description.hidden = !chat.partner.description;
  document.getElementById('detailStatus').textContent = chat.isFavorites ? '● личные заметки' : chat.partner.is_deleted ? '● удаленный аккаунт' : chat.partner.is_bot ? '● бот Qwant' : '● личный чат';
  document.getElementById('mediaGrid').replaceChildren();
  document.getElementById('sharedLinks').replaceChildren();
  document.getElementById('mediaCount').textContent = '0';
  document.getElementById('linkCount').textContent = '0';
  document.getElementById('mediaEmpty').hidden = false;
  document.getElementById('linksEmpty').hidden = false;
  renderMessages(chat, true);
  renderSharedDetails(chat);
  renderChats();
  const activeTab = document.querySelector(`[data-mobile-tab="${chat.isFavorites ? 'favorites' : 'chats'}"]`);
  if (activeTab) setMobileTabActive(activeTab);
  const conversation = document.querySelector('.conversation');
  conversation.classList.remove('chat-opening');
  void conversation.offsetWidth;
  if (window.matchMedia('(max-width: 760px)').matches) conversation.classList.add('chat-opening');
  app.classList.add('show-conversation');
  if (chat.isFavorites) loadFavoriteMessages(chat);
  else loadChatMessages(chat);
}

async function refreshChats() {
  if (refreshing) return;
  refreshing = true;
  const shouldRefreshConversation = isConversationVisible();
  try {
    await loadChats();
    if (shouldRefreshConversation && activeId) {
      const chat = chats.find(item => item.id === activeId);
      if (chat?.isFavorites) await loadFavoriteMessages(chat);
      else if (chat) await loadChatMessages(chat);
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
        <span class="chat-copy"><span class="chat-top"><span class="chat-name">${escapeHtml(person.display_name || person.username)}</span></span><span class="chat-preview">${person.is_bot ? 'Бот · ' : ''}@${escapeHtml(person.username)} · Начать переписку</span></span>
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

nicknameForm.addEventListener('submit', async event => {
  event.preventDefault();
  setAuthError();
  const username = document.getElementById('authUsername').value.trim();
  setBusy(nicknameForm, true, 'Продолжить');
  try {
    const result = await api('/api/auth/check-username', { method:'POST', body:JSON.stringify({ username }) });
    authFlowUsername = result.username || username;
    if (result.exists) {
      showAuthStep(loginForm, `NickName @${username}`, 'С возвращением', 'Введите пароль от аккаунта FernieID.', 'authPassword');
    } else {
      showAuthStep(signupPasswordForm, `NickName @${username}`, 'Создание аккаунта', 'Придумайте надёжный пароль. На следующем шаге зададите отображаемое имя.', 'signupPassword');
    }
  } catch (error) {
    setAuthError(error.message);
  } finally {
    setBusy(nicknameForm, false, 'Продолжить');
  }
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  setAuthError();
  setBusy(loginForm, true, 'Входим');
  try {
    const result = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username:authFlowUsername, password:document.getElementById('authPassword').value })
    });
    if (result.require2fa) {
      pendingChallenge = result.challengeId;
      showAuthStep(verifyForm, 'Защита аккаунта', 'Подтвердите вход', 'Введите одноразовый код из Telegram.', 'authCode');
    } else {
      unlock(result);
    }
  } catch (error) {
    setAuthError(error.message);
  } finally {
    setBusy(loginForm, false, 'Войти');
  }
});

signupPasswordForm.addEventListener('submit', event => {
  event.preventDefault();
  const password = document.getElementById('signupPassword').value;
  const confirmation = document.getElementById('signupPasswordConfirm').value;
  if (password.length < 8) return setAuthError('Пароль должен содержать не менее 8 символов.');
  if (password !== confirmation) return setAuthError('Пароли не совпадают.');
  pendingSignupPassword = password;
  showAuthStep(displayNameForm, `NickName @${authFlowUsername}`, 'Почти готово', 'Выберите имя, которое будут видеть собеседники. Его можно изменить позже.', 'displayName');
});

displayNameForm.addEventListener('submit', async event => {
  event.preventDefault();
  setAuthError();
  setBusy(displayNameForm, true, 'Создаём аккаунт');
  try {
    const result = await api('/api/auth/register', {
      method:'POST',
      body:JSON.stringify({
        username:authFlowUsername,
        password:pendingSignupPassword,
        displayName:document.getElementById('displayName').value.trim()
      })
    });
    unlock(result);
  } catch (error) {
    setAuthError(error.message);
  } finally {
    setBusy(displayNameForm, false, 'Создать аккаунт');
  }
});

verifyForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!pendingChallenge) return showAuth('Запрос входа устарел. Введите логин и пароль снова.');
  const code = authCodeInput.value;
  if (!/^\d{8}$/.test(code)) {
    setAuthError('Введите все 8 цифр кода.');
    await animateAuthCode(false);
    authCodeInput.focus();
    return;
  }
  setAuthError();
  setBusy(verifyForm, true, 'Проверяем код');
  authCodeInput.disabled = true;
  try {
    const result = await api('/api/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ challengeId: pendingChallenge, code })
    });
    await animateAuthCode(true);
    unlock(result);
  } catch (error) {
    setAuthError(error.message);
    if (error.status && error.status < 500) await animateAuthCode(false);
  } finally {
    authCodeInput.disabled = false;
    setBusy(verifyForm, false, 'Подтвердить вход');
    if (!authScreen.classList.contains('is-hidden')) authCodeInput.focus();
  }
});

authCodeInput.addEventListener('input', () => {
  authCodeInput.value = authCodeInput.value.replace(/\D/g, '').slice(0, 8);
  renderAuthCode();
  setAuthError();
});
authCodeInput.addEventListener('focus', () => authCodeInput.setSelectionRange(authCodeInput.value.length, authCodeInput.value.length));
authCodeInput.addEventListener('pointerdown', () => {
  requestAnimationFrame(() => authCodeInput.setSelectionRange(authCodeInput.value.length, authCodeInput.value.length));
});

document.getElementById('backToNickname').addEventListener('click', () => {
  pendingChallenge = null;
  authCodeInput.value = '';
  renderAuthCode();
  document.getElementById('authPassword').value = '';
  showAuthStep(nicknameForm, 'Ваше пространство для общения', 'FernieID NickName', 'Введите свой NickName, чтобы войти или создать аккаунт.', 'authUsername');
});
document.getElementById('backFromLogin').addEventListener('click', () => {
  document.getElementById('authPassword').value = '';
  showAuthStep(nicknameForm, 'Ваше пространство для общения', 'FernieID NickName', 'Введите свой NickName, чтобы войти или создать аккаунт.', 'authUsername');
});
document.getElementById('backFromSignupPassword').addEventListener('click', () => {
  pendingSignupPassword = '';
  signupPasswordForm.reset();
  showAuthStep(nicknameForm, 'Ваше пространство для общения', 'FernieID NickName', 'Введите свой NickName, чтобы войти или создать аккаунт.', 'authUsername');
});
document.getElementById('backFromDisplayName').addEventListener('click', () => {
  showAuthStep(signupPasswordForm, `NickName @${authFlowUsername}`, 'Создание аккаунта', 'Придумайте надёжный пароль. На следующем шаге зададите отображаемое имя.', 'signupPassword');
});

function closeMessageMenu() {
  document.getElementById('messageContextMenu').classList.remove('open');
  document.getElementById('messageContextMenu').replaceChildren();
}

function closeChatContextMenu() {
  const menu = document.getElementById('chatContextMenu');
  menu.classList.remove('open');
  menu.replaceChildren();
}

function openChatContextMenu(chatId, x, y) {
  const chat = chats.find(item => String(item.id) === String(chatId));
  if (!chat || chat.isFavorites) return;
  closeMessageMenu();
  const menu = document.getElementById('chatContextMenu');
  menu.innerHTML = `
    <div class="context-menu-date">${escapeHtml(chat.name)}</div>
    <div class="context-menu-divider"></div>
    <button class="context-menu-action" type="button" data-chat-action="pin"><svg viewBox="0 0 24 24"><path d="m16 3 5 5-4 1-4 4 2 2-2 2-4-4-5 5M8 8l2-2 2 2 4-4 1-4"/></svg>${chat.pinned ? 'Открепить' : 'Закрепить'}</button>
    <button class="context-menu-action" type="button" data-chat-action="unread"><svg viewBox="0 0 24 24"><path d="M4 5h16v12H8l-4 3Z"/><path d="M8 9h8M8 13h5"/></svg>Пометить как непрочитанное</button>
    <button class="context-menu-action" type="button" data-chat-action="clear"><svg viewBox="0 0 24 24"><path d="m4 16 8-8 4 4-8 8H4zM13 7l2-2 4 4-2 2M4 20h16"/></svg>Очистить историю</button>
    <button class="context-menu-action danger" type="button" data-chat-action="delete"><svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/></svg>Удалить чат</button>`;
  menu.dataset.chatId = String(chat.id);
  menu.classList.add('open');
  const bounds = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))}px`;
}

function togglePinnedChat(chatId) {
  const chat = chats.find(item => String(item.id) === String(chatId));
  if (!chat || chat.isFavorites || !session?.userId) return;
  chat.pinned = !chat.pinned;
  if (chat.pinned) pinnedChatIds.add(String(chat.id));
  else pinnedChatIds.delete(String(chat.id));
  localStorage.setItem(`ferniex_messenger_pins_${session.userId}`, JSON.stringify([...pinnedChatIds]));
  renderChats();
  showMessageToast(chat.pinned ? 'Чат закреплён' : 'Чат откреплён');
}

async function markChatUnread(chatId) {
  const chat = chats.find(item => String(item.id) === String(chatId));
  if (!chat || chat.isFavorites) return;
  try {
    const result = await api(`/api/social/chats/${encodeURIComponent(chat.id)}/unread`, { method:'POST' });
    if (activeId === chat.id) {
      api(`/api/social/chats/${encodeURIComponent(chat.id)}/presence`, { method:'DELETE' }).catch(() => {});
      activeId = null;
      document.getElementById('chatAppearance').hidden = true;
      applyChatBackground(null);
      app.classList.remove('show-conversation');
    }
    await loadChats();
    showMessageToast(result.unread ? 'Чат помечен как непрочитанный' : 'В этом чате нет входящих сообщений');
  } catch (error) {
    showMessageToast(error.message || 'Не удалось пометить чат');
  }
}

async function hideChatFromList(chatId) {
  const chat = chats.find(item => String(item.id) === String(chatId));
  if (!chat || chat.isFavorites || !await confirmAction(`Удалить чат «${chat.name}» из списка и очистить переписку?`, { title: 'Удалить чат', danger: true })) return;
  chatListRevision += 1;
  chatHistoryVersions.set(String(chat.id), (chatHistoryVersions.get(String(chat.id)) || 0) + 1);
  try {
    await api(`/api/social/chats/${encodeURIComponent(chat.id)}/hide`, { method:'POST' });
    chatListRevision += 1;
    chatHistoryVersions.set(String(chat.id), (chatHistoryVersions.get(String(chat.id)) || 0) + 1);
    chats = chats.filter(item => String(item.id) !== String(chat.id));
    pinnedChatIds.delete(String(chat.id));
    if (session?.userId) localStorage.setItem(`ferniex_messenger_pins_${session.userId}`, JSON.stringify([...pinnedChatIds]));
    if (activeId === chat.id) {
      activeId = null;
      document.getElementById('chatAppearance').hidden = true;
      applyChatBackground(null);
      app.classList.remove('show-conversation');
      document.getElementById('messageForm').hidden = false;
      document.getElementById('deletedChatActions').hidden = true;
      messages.innerHTML = '<div class="empty-state">Чат удален из вашего списка.</div>';
    }
    renderChats();
    showMessageToast('Чат удалён из списка');
  } catch (error) {
    showMessageToast(error.message || 'Не удалось удалить чат');
  }
}

async function clearChatHistory(chatId) {
  const chat = chats.find(item => String(item.id) === String(chatId));
  if (!chat || !await confirmAction(`Удалить все сообщения в переписке с «${chat.name}»? Чат останется в списке.`, { title: 'Очистить историю' })) return;
  chatListRevision += 1;
  chatHistoryVersions.set(String(chat.id), (chatHistoryVersions.get(String(chat.id)) || 0) + 1);
  try {
    await api(`/api/social/chats/${encodeURIComponent(chat.id)}/clear`, { method: 'POST' });
    chatListRevision += 1;
    chatHistoryVersions.set(String(chat.id), (chatHistoryVersions.get(String(chat.id)) || 0) + 1);
    chat.messages = [];
    chat.messagesLoaded = true;
    chat.lastMessageAt = null;
    chat.preview = 'Начните переписку';
    chat.time = '';
    chat.unread = 0;
    if (activeId === chat.id) {
      clearReply();
      renderMessages(chat);
      renderSharedDetails(chat);
    }
    renderChats();
    showMessageToast('История переписки очищена');
    loadChats();
  } catch (error) {
    showMessageToast(error.message || 'Не удалось очистить историю');
  }
}

async function handleChatMenuAction(action, chatId) {
  closeChatContextMenu();
  if (action === 'pin') togglePinnedChat(chatId);
  if (action === 'unread') await markChatUnread(chatId);
  if (action === 'clear') await clearChatHistory(chatId);
  if (action === 'delete') await hideChatFromList(chatId);
}

function showMessageToast(text) {
  const toast = document.getElementById('messageToast');
  toast.textContent = text;
  toast.classList.add('visible');
  clearTimeout(showMessageToast.timer);
  showMessageToast.timer = setTimeout(() => toast.classList.remove('visible'), 1800);
}

function messageCopyText(message) {
  if (message.type === 'udg_gift' && message.gift) {
    const gift = message.gift;
    return [`Подарок: ${gift.model_name || gift.gift_id || 'UDG'}`, gift.collection_name, gift.uid ? giftPageUrl(gift) : ''].filter(Boolean).join('\n');
  }
  return message.text || message.imageUrl || '';
}

function messageImageUrl(message) {
  return message.localImage ? message.imageUrl : safeImageUrl(message.imageUrl || (message.type === 'udg_gift' ? message.gift?.image_url : ''));
}

async function copyImage(messageId) {
  const chat = chats.find(item => item.id === activeId);
  const message = chat?.messages.find(item => String(item.id) === String(messageId));
  const imageUrl = message && messageImageUrl(message);
  if (!imageUrl) return showMessageToast('В этом сообщении нет изображения');
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return showMessageToast('Копирование изображения не поддерживается браузером');
  try {
    const imagePromise = fetch(imageUrl, { mode: 'cors', credentials: 'omit' }).then(async response => {
      if (!response.ok) throw new Error('Не удалось загрузить изображение');
      const source = await response.blob();
      if (source.type === 'image/png') return source;
      const bitmap = await createImageBitmap(source);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0);
        return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Не удалось подготовить изображение')), 'image/png'));
      } finally {
        bitmap.close();
      }
    });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': imagePromise })]);
    showMessageToast('Изображение скопировано');
  } catch (error) {
    showMessageToast(error.message || 'Не удалось скопировать изображение');
  }
}

function openMessageMenu(messageId, x, y) {
  const chat = chats.find(item => item.id === activeId);
  const message = chat?.messages.find(item => String(item.id) === String(messageId));
  if (!message) return;
  closeChatContextMenu();
  const menu = document.getElementById('messageContextMenu');
  const timestamp = formatDateTime(message.createdAt).replace(',', ' в');
  const imageAction = messageImageUrl(message)
    ? '<button class="context-menu-action" type="button" data-message-action="copy-image"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></svg>Копировать изображение</button>'
    : '<button class="context-menu-action" type="button" data-message-action="copy"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>Скопировать сообщение</button>';
  const replyAction = chat.isFavorites ? '' : '<button class="context-menu-action" type="button" data-message-action="reply"><svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v2"/></svg>Ответить</button>';
  menu.innerHTML = `
    <div class="context-menu-date">${escapeHtml(timestamp)}${message.readAt && message.own ? '　✓✓' : ''}</div>
    <div class="context-menu-divider"></div>
    ${replyAction}
    ${imageAction}
    ${message.own ? '<button class="context-menu-action danger" type="button" data-message-action="delete"><svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/></svg>Удалить</button>' : ''}`;
  menu.classList.add('open');
  const bounds = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))}px`;
  menu.dataset.messageId = String(message.id);
}

function startReply(messageId) {
  const chat = chats.find(item => item.id === activeId);
  const message = chat?.messages.find(item => String(item.id) === String(messageId));
  if (!message) return;
  replyToMessageId = String(message.id);
  document.getElementById('replyBarTitle').textContent = message.own ? 'Ответ на ваше сообщение' : `Ответ ${chat.name}`;
  document.getElementById('replyBarText').textContent = message.type === 'udg_gift' ? `🎁 ${message.gift?.model_name || 'Подарок UDG'}` : message.text || (message.imageUrl ? 'Фото' : 'Сообщение');
  document.getElementById('replyBar').hidden = false;
  messageInput.focus();
}

function clearReply() {
  replyToMessageId = null;
  const bar = document.getElementById('replyBar');
  if (bar) bar.hidden = true;
}

async function copyMessage(messageId) {
  const chat = chats.find(item => item.id === activeId);
  const message = chat?.messages.find(item => String(item.id) === String(messageId));
  if (!message) return;
  if (messageImageUrl(message)) return copyImage(messageId);
  try {
    await navigator.clipboard.writeText(messageCopyText(message));
    showMessageToast('Сообщение скопировано');
  } catch {
    showMessageToast('Не удалось скопировать сообщение');
  }
}

async function deleteMessage(messageId) {
  const chat = chats.find(item => item.id === activeId);
  const message = chat?.messages.find(item => String(item.id) === String(messageId));
  if (!chat || !message?.own || !await confirmAction('Удалить это сообщение?', { title: 'Удалить сообщение', danger: true })) return;
  try {
    if (chat.isFavorites) {
      if (!String(message.id).startsWith('favorite-pending-')) {
        await api(`/api/social/favorites/messages/${encodeURIComponent(message.id)}`, { method: 'DELETE' });
      }
      chat.messages = chat.messages.filter(item => String(item.id) !== String(message.id));
      const latest = chat.messages.at(-1);
      chat.lastMessageAt = latest?.createdAt || null;
      chat.preview = latest?.text || 'Сохраняйте сообщения и заметки здесь';
      chat.time = latest?.time || '';
      cacheFavoriteMessages(chat);
      renderMessages(chat);
      renderChats();
    } else {
      await api(`/api/social/chats/${encodeURIComponent(chat.id)}/messages/${encodeURIComponent(message.id)}`, { method: 'DELETE' });
      await loadChatMessages(chat);
      await loadChats();
    }
    showMessageToast('Сообщение удалено');
  } catch (error) {
    showMessageToast(error.message);
  }
}

async function sendFavoriteMessage(body, existingMessage = null, focusComposer = true) {
  const chat = chats.find(item => item.id === favoritesChatId());
  body = String(body || '').trim();
  if (!chat || !body) return false;
  const pending = existingMessage || {
    id:`favorite-pending-${crypto.randomUUID()}`,
    conversationId:chat.id,
    text:body,
    imageUrl:'',
    type:'text',
    gift:null,
    createdAt:new Date().toISOString(),
    time:formatTime(new Date()),
    readAt:new Date().toISOString(),
    albumId:'',
    own:true,
    favoriteMessage:true
  };
  pending.sendStatus = 'sending';
  chat.messages = chat.messages.filter(item => String(item.id) !== String(pending.id));
  chat.messages.push(pending);
  chat.messages.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
  chat.messagesLoaded = true;
  chat.preview = body;
  chat.lastMessageAt = pending.createdAt;
  chat.time = pending.time;
  messageInput.value = '';
  clearReply();
  if (activeId === chat.id) renderMessages(chat);
  renderChats();
  try {
    const result = await api('/api/social/favorites/messages', {
      method:'POST',
      body:JSON.stringify({ body })
    });
    const sent = mapFavoriteMessages([result.message], chat.id)[0];
    const currentChat = chats.find(item => item.id === chat.id) || chat;
    currentChat.messages = currentChat.messages.filter(item => String(item.id) !== String(pending.id) && String(item.id) !== String(sent.id));
    currentChat.messages.push(sent);
    currentChat.messages.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    currentChat.messagesLoaded = true;
    currentChat.preview = sent.text;
    currentChat.lastMessageAt = sent.createdAt;
    currentChat.time = sent.time;
    cacheFavoriteMessages(currentChat);
    if (activeId === currentChat.id) renderMessages(currentChat);
    renderChats();
    if (focusComposer && activeId === currentChat.id) messageInput.focus();
    return true;
  } catch (error) {
    pending.sendStatus = 'failed';
    const currentChat = chats.find(item => item.id === chat.id) || chat;
    if (activeId === currentChat.id) renderMessages(currentChat);
    showMessageToast(error.message || 'Не удалось сохранить заметку');
    return false;
  }
}

async function sendMessage(body, imageBase64 = '', existingMessage = null, focusComposer = true, refreshChatList = true) {
  const conversationId = existingMessage?.conversationId || activeId;
  const chat = chats.find(item => item.id === conversationId);
  body = String(body || '').trim();
  if (!chat || (!body && !imageBase64)) return false;
  if (chat.isFavorites) {
    if (imageBase64) {
      showMessageToast('В Избранное можно отправлять только текст');
      return false;
    }
    return sendFavoriteMessage(body, existingMessage, focusComposer);
  }
  const createdAt = existingMessage?.createdAt || new Date().toISOString();
  const replied = !existingMessage && replyToMessageId
    ? chat.messages.find(message => String(message.id) === String(replyToMessageId))
    : null;
  const pendingMessage = existingMessage || {
    id: `local-${crypto.randomUUID()}`,
    conversationId,
    localMessage: true,
    text: body,
    imageUrl: imageBase64,
    localImage: Boolean(imageBase64),
    type: 'text',
    gift: null,
    replyToMessageId,
    replyText: replied ? (replied.deletedAt ? 'Сообщение удалено' : replied.type === 'udg_gift' ? replied.gift?.model_name || 'Подарок UDG' : replied.text || (replied.imageUrl ? 'Фото' : 'Сообщение')) : '',
    replySender: replied ? (replied.own ? 'Вы' : 'Собеседник') : '',
    createdAt,
    time: formatTime(createdAt),
    readAt: null,
    albumId: '',
    own: true
  };
  pendingMessage.sendStatus = 'sending';
  chat.messages = chat.messages.filter(message => message.id !== pendingMessage.id);
  chat.messages.push(pendingMessage);
  chat.messages.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
  chat.messagesLoaded = true;
  chat.preview = body || (imageBase64 ? '📷 Фото' : 'Начните переписку');
  chat.lastMessageAt = createdAt;
  chat.time = formatTime(createdAt);
  if (!existingMessage && !imageBase64) messageInput.value = '';
  if (!existingMessage) clearReply();
  if (activeId === conversationId) renderMessages(chat);
  renderChats();
  try {
    const result = await api(`/api/social/chats/${encodeURIComponent(conversationId)}/messages`, {
      method:'POST',
      body:JSON.stringify({ body, ...(imageBase64 ? { imageBase64 } : {}), ...(pendingMessage.replyToMessageId ? { replyToMessageId:pendingMessage.replyToMessageId } : {}) })
    });
    const sentMessage = mapMessages([result.message])[0];
    sentMessage.replyText = pendingMessage.replyText;
    sentMessage.replySender = pendingMessage.replySender;
    sentMessage.albumId = pendingMessage.albumId || '';
    sentMessage.sendStatus = 'sent';
    if (sentMessage.albumId) savePhotoAlbumId(sentMessage.id, sentMessage.albumId);
    const currentChat = chats.find(item => item.id === conversationId) || chat;
    currentChat.messages = currentChat.messages.filter(message => message.id !== pendingMessage.id && String(message.id) !== String(sentMessage.id));
    currentChat.messages.push(sentMessage);
    currentChat.messages.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
    currentChat.preview = body || (sentMessage.imageUrl ? '📷 Фото' : currentChat.preview);
    currentChat.lastMessageAt = sentMessage.createdAt;
    currentChat.time = formatTime(sentMessage.createdAt);
    if (activeId === conversationId) {
      renderMessages(currentChat);
      renderSharedDetails(currentChat);
    }
    renderChats();
    if (refreshChatList) loadChats();
    if (focusComposer && activeId === conversationId) messageInput.focus();
    return true;
  } catch (error) {
    const currentChat = chats.find(item => item.id === conversationId) || chat;
    const currentMessage = currentChat.messages.find(message => message.id === pendingMessage.id);
    if (currentMessage) currentMessage.sendStatus = 'failed';
    if (activeId === conversationId) renderMessages(currentChat);
    showMessageToast(error.message || 'Не удалось отправить сообщение');
    return false;
  }
}

async function sendPhotoSelection() {
  const chat = chats.find(item => String(item.id) === String(pendingPhotoConversationId));
  if (!chat || !pendingPhotos.length) return;
  const conversationId = String(chat.id);
  const caption = photoSendCaption.value.trim();
  const replied = replyToMessageId ? chat.messages.find(message => String(message.id) === String(replyToMessageId)) : null;
  const pendingMessages = [];
  for (let start = 0; start < pendingPhotos.length; start += 4) {
    const albumId = crypto.randomUUID();
    pendingPhotos.slice(start, start + 4).forEach((photo, offset) => {
      const firstInAlbum = offset === 0;
      const createdAt = new Date(Date.now() + pendingMessages.length).toISOString();
      pendingMessages.push({
        id: `local-${crypto.randomUUID()}`,
        conversationId,
        localMessage: true,
        text: pendingMessages.length === 0 ? caption : '',
        imageUrl: photo.dataUrl,
        localImage: true,
        type: 'text',
        gift: null,
        replyToMessageId: firstInAlbum && start === 0 ? replyToMessageId : null,
        replyText: firstInAlbum && start === 0 && replied ? (replied.deletedAt ? 'Сообщение удалено' : replied.type === 'udg_gift' ? replied.gift?.model_name || 'Подарок UDG' : replied.text || (replied.imageUrl ? 'Фото' : 'Сообщение')) : '',
        replySender: firstInAlbum && start === 0 && replied ? (replied.own ? 'Вы' : 'Собеседник') : '',
        createdAt,
        time: formatTime(createdAt),
        readAt: null,
        albumId,
        sendStatus: 'sending',
        own: true
      });
    });
  }
  chat.messages.push(...pendingMessages);
  chat.messages.sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
  chat.messagesLoaded = true;
  chat.preview = caption || '📷 Фото';
  chat.lastMessageAt = pendingMessages[pendingMessages.length - 1].createdAt;
  chat.time = pendingMessages[pendingMessages.length - 1].time;
  clearReply();
  closePhotoSend();
  if (activeId === conversationId) renderMessages(chat);
  renderChats();
  for (const message of pendingMessages) {
    await sendMessage(message.text, message.imageUrl, message, false, false);
  }
  await loadChats();
}

async function deleteDeletedAccountChat() {
  const chat = chats.find(item => item.id === activeId);
  if (!chat?.partner.is_deleted || !await confirmAction(`Удалить чат с «${chat.name}»? Все сообщения в этой переписке будут удалены.`, { title: 'Удалить переписку', danger: true })) return;
  const button = document.getElementById('deleteDeletedChat');
  const status = document.getElementById('deleteDeletedChatStatus');
  button.disabled = true;
  status.textContent = 'Удаляем чат…';
  try {
    await api(`/api/social/chats/${encodeURIComponent(chat.id)}`, { method:'DELETE' });
    chats = chats.filter(item => item.id !== chat.id);
    activeId = null;
    document.getElementById('chatAppearance').hidden = true;
    applyChatBackground(null);
    document.getElementById('messageForm').hidden = false;
    document.getElementById('deletedChatActions').hidden = true;
    document.getElementById('headerName').textContent = 'Выберите чат';
    document.getElementById('headerStatus').textContent = 'Qwant Messenger';
    document.getElementById('detailName').textContent = 'Qwant Messenger';
    document.getElementById('detailHandle').textContent = 'Выберите чат';
    document.getElementById('detailStatus').textContent = '● защищённый доступ';
    setAvatar(document.getElementById('headerAvatar'), { username:'Qwant' });
    setAvatar(document.getElementById('detailAvatar'), { username:'Qwant' });
    messages.innerHTML = chats.length
      ? '<div class="empty-state">Чат удален.<br>Выберите другую переписку.</div>'
      : '<div class="empty-state">Чат удален.<br>Здесь появятся ваши чаты.</div>';
    renderChats();
    app.classList.remove('show-conversation');
  } catch (error) {
    status.textContent = error.message || 'Не удалось удалить чат';
  } finally {
    button.disabled = false;
  }
}

document.getElementById('messageForm').addEventListener('submit', async event => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !activeId) return;
  sendMessage(text);
});

document.getElementById('deleteDeletedChat').addEventListener('click', deleteDeletedAccountChat);

document.getElementById('cancelReply').addEventListener('click', clearReply);

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
  if (activeId && !String(activeId).startsWith('favorites-')) api(`/api/social/chats/${encodeURIComponent(activeId)}/presence`, { method: 'DELETE' }).catch(() => {});
  app.classList.remove('show-conversation');
  document.querySelector('.conversation').classList.remove('favorites-chat', 'chat-opening');
  document.getElementById('attachButton').hidden = false;
  messageInput.placeholder = 'Написать сообщение…';
  const chatsTab = document.querySelector('[data-mobile-tab="chats"]');
  if (chatsTab) setMobileTabActive(chatsTab);
});
document.querySelectorAll('[data-mobile-tab]').forEach(button => button.addEventListener('click', () => {
  const tab = button.dataset.mobileTab;
  setMobileTabActive(button);
  if (tab === 'favorites') {
    closeDrawer();
    searchUsers = false;
    searchInput.value = '';
    searchInput.placeholder = 'Поиск по чатам';
    const favoriteChat = chats.find(chat => chat.isFavorites);
    if (favoriteChat && activeId !== favoriteChat.id) selectChat(favoriteChat.id);
    return;
  }
  if (tab === 'chats') {
    closeDrawer();
    if (app.classList.contains('show-conversation')) document.getElementById('backToChats').click();
    searchUsers = false;
    searchInput.value = '';
    searchInput.placeholder = 'Поиск по чатам';
    renderChats();
    return;
  }
  if (tab === 'settings') {
    if (!drawerBackdrop.classList.contains('open')) openDrawer();
  }
}));
document.getElementById('newChat').addEventListener('click', () => {
  searchUsers = true;
  searchInput.value = '';
  searchInput.placeholder = 'Найдите пользователя';
  chatList.innerHTML = '<div class="empty-state">Введите имя пользователя FernieID</div>';
  searchInput.focus();
});
document.getElementById('menuToggle').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', () => {
  closeDrawer();
  const chatsTab = document.querySelector('[data-mobile-tab="chats"]');
  if (chatsTab) setMobileTabActive(chatsTab);
});
document.addEventListener('gesturestart', event => event.preventDefault(), { passive: false });
document.addEventListener('gesturechange', event => event.preventDefault(), { passive: false });
drawerBackdrop.addEventListener('click', event => {
  if (event.target === drawerBackdrop) {
    closeDrawer();
    const chatsTab = document.querySelector('[data-mobile-tab="chats"]');
    if (chatsTab) setMobileTabActive(chatsTab);
  }
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
document.querySelectorAll('[data-drawer-settings]').forEach(button => button.addEventListener('click', () => openSettings(button.dataset.drawerSettings)));
document.getElementById('drawerBots').addEventListener('click', openBotManager);
document.getElementById('drawerPlus').addEventListener('click', () => openSettings('plus'));
document.getElementById('drawerCoins').addEventListener('click', () => openSettings('coins'));
document.getElementById('botManagerClose').addEventListener('click', closeBotManager);
document.getElementById('botManager').addEventListener('click', event => {
  if (event.target.id === 'botManager') closeBotManager();
});
document.getElementById('botCreateForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  document.getElementById('botTokenNotice').hidden = true;
  setBotStatus('Создаём профиль…');
  try {
    const result = await api('/api/qwant/bots', {
      method:'POST',
      body:JSON.stringify({
        displayName:document.getElementById('botDisplayName').value.trim(),
        username:document.getElementById('botUsername').value.trim()
      })
    });
    document.getElementById('botTokenValue').textContent = result.token;
    document.getElementById('botTokenNotice').hidden = false;
    form.reset();
    setBotStatus('Бот создан. Сохраните токен — повторно он не отображается.');
    await loadManagedBots();
  } catch (error) {
    setBotStatus(error.message);
  } finally {
    button.disabled = false;
  }
});
document.getElementById('botTokenCopy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById('botTokenValue').textContent);
    document.getElementById('botTokenCopy').textContent = 'Скопировано';
  } catch {
    setBotStatus('Не удалось скопировать токен. Выделите и скопируйте его вручную.');
  }
});
document.getElementById('botInboxRefresh').addEventListener('click', loadManagedBotInbox);
document.getElementById('botSettingsOpen').addEventListener('click', openBotSettings);
document.getElementById('botSettingsClose').addEventListener('click', closeBotSettings);
document.querySelectorAll('[data-bot-settings-page]').forEach(button => button.addEventListener('click', () => showBotSettingsPage(button.dataset.botSettingsPage)));
document.getElementById('botTokenVisibility').addEventListener('click', event => {
  const input = document.getElementById('managedBotToken');
  input.type = input.type === 'password' ? 'text' : 'password';
  event.currentTarget.textContent = input.type === 'password' ? 'Показать' : 'Скрыть';
});
document.getElementById('botManagedTokenCopy').addEventListener('click', async () => {
  const token = document.getElementById('managedBotToken').value;
  if (!token) return;
  try {
    await navigator.clipboard.writeText(token);
    document.getElementById('botDataStatus').textContent = 'Токен скопирован.';
  } catch {
    document.getElementById('botDataStatus').textContent = 'Не удалось скопировать токен.';
  }
});
document.getElementById('botRotateToken').addEventListener('click', rotateManagedBotToken);
document.getElementById('botAppearanceForm').addEventListener('submit', saveManagedBotAppearance);
document.getElementById('botAvatarInput').addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    event.target.value = '';
    document.getElementById('botAppearanceStatus').textContent = 'Поддерживаются JPG, PNG и WEBP.';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    event.target.value = '';
    document.getElementById('botAppearanceStatus').textContent = 'Размер аватара не должен превышать 5 МБ.';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    pendingBotAvatarBase64 = String(reader.result);
    removeBotAvatar = false;
    renderBotAvatar(pendingBotAvatarBase64);
    document.getElementById('botAppearanceStatus').textContent = 'Новое фото выбрано. Сохраните оформление.';
  };
  reader.onerror = () => document.getElementById('botAppearanceStatus').textContent = 'Не удалось прочитать изображение.';
  reader.readAsDataURL(file);
});
document.getElementById('botAvatarRemove').addEventListener('click', () => {
  pendingBotAvatarBase64 = '';
  removeBotAvatar = true;
  document.getElementById('botAvatarInput').value = '';
  renderBotAvatar('');
  document.getElementById('botAppearanceStatus').textContent = 'Аватар будет удален после сохранения.';
});
document.getElementById('botDeleteButton').addEventListener('click', deleteManagedBot);
document.getElementById('botSettingsOverlay').addEventListener('click', event => {
  if (event.target.id === 'botSettingsOverlay') closeBotSettings();
});
document.getElementById('botBackToList').addEventListener('click', () => {
  selectedManagedBot = null;
  selectedBotChat = null;
  hideBotPanel(document.getElementById('botInboxPanel'));
  hideBotPanel(document.getElementById('botThreadPanel'));
  showBotPanel(document.getElementById('botListPanel'));
});
document.getElementById('botBackToInbox').addEventListener('click', () => {
  selectedBotChat = null;
  hideBotPanel(document.getElementById('botThreadPanel'));
  showBotPanel(document.getElementById('botInboxPanel'));
});
document.getElementById('botReplyForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!selectedManagedBot || !selectedBotChat) return;
  const input = document.getElementById('botReplyInput');
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await api(`/api/qwant/bots/${encodeURIComponent(selectedManagedBot.id)}/chats/${encodeURIComponent(selectedBotChat.id)}/messages`, {
      method:'POST', body:JSON.stringify({ body:input.value.trim() })
    });
    input.value = '';
    await Promise.all([loadManagedBotMessages(), loadManagedBotInbox()]);
  } catch (error) {
    setBotStatus(error.message);
  } finally {
    button.disabled = false;
  }
});
document.getElementById('profileOpenButton').addEventListener('click', () => {
  const chat = chats.find(item => item.id === activeId);
  if (chat) openProfile(chat.partner);
});
document.getElementById('profileMessageButton').addEventListener('click', () => messageInput.focus());
document.getElementById('profileClose').addEventListener('click', closeProfile);
profileScreen.addEventListener('click', event => {
  if (event.target === profileScreen) closeProfile();
});
document.getElementById('accountDisplayNameForm').addEventListener('submit', async event => {
  event.preventDefault();
  const input = document.getElementById('accountDisplayNameInput');
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  document.getElementById('accountDisplayNameStatus').textContent = 'Сохраняем имя…';
  try {
    const result = await api('/api/qwant/profile/display-name', {
      method:'PATCH', body:JSON.stringify({ displayName:input.value.trim() })
    });
    session.displayName = result.displayName;
    localStorage.setItem('ferniex_messenger_session', JSON.stringify(session));
    updateAccountMenu();
    currentProfile = { ...currentProfile, display_name: result.displayName };
    renderProfile(currentProfile, true);
    document.getElementById('accountDisplayNameStatus').textContent = 'Отображаемое имя сохранено.';
  } catch (error) {
    document.getElementById('accountDisplayNameStatus').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
document.getElementById('appDialogCancel').addEventListener('click', () => closeDialog(null));
document.getElementById('appDialog').addEventListener('click', event => {
  if (event.target === appDialog) closeDialog(null);
});
document.getElementById('appDialogForm').addEventListener('submit', event => {
  event.preventDefault();
  closeDialog(document.getElementById('appDialogInput').hidden ? true : document.getElementById('appDialogInput').value);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDialog(null);
    closeProfile();
  }
});
messages.addEventListener('click', event => {
  if (suppressMessageClick) {
    suppressMessageClick = false;
    event.preventDefault();
    return;
  }
  const retryButton = event.target.closest('[data-retry-message]');
  if (retryButton) {
    const chat = chats.find(item => item.id === activeId);
    const failedMessage = chat?.messages.find(message => String(message.id) === retryButton.dataset.retryMessage && message.sendStatus === 'failed');
    if (failedMessage) sendMessage(failedMessage.text, failedMessage.localImage ? failedMessage.imageUrl : '', failedMessage, false);
    return;
  }
  const photo = event.target.closest('[data-view-photo], .album-tile[data-message-id]');
  if (photo) {
    openPhotoViewer(photo.dataset.viewPhoto || photo.dataset.messageId);
    return;
  }
  const button = event.target.closest('[data-gift-open]');
  if (!button) return;
  const chat = chats.find(item => item.id === activeId);
  const giftMessage = chat?.messages.find(message => message.id === button.dataset.giftOpen && message.type === 'udg_gift');
  if (giftMessage) openGift(giftMessage.gift || { model_name: 'Подарок UDG', collection_name: 'Детали подарка недоступны' });
});
messages.addEventListener('keydown', event => {
  if (!['Enter', ' '].includes(event.key)) return;
  const tile = event.target.closest('.album-tile[role="button"]');
  if (!tile) return;
  event.preventDefault();
  openPhotoViewer(tile.dataset.messageId);
});
document.getElementById('mediaGrid').addEventListener('click', event => {
  const photo = event.target.closest('[data-view-photo]');
  if (photo) openPhotoViewer(photo.dataset.viewPhoto);
});
messages.addEventListener('contextmenu', event => {
  const target = event.target.closest('.album-tile[data-message-id], .message-row[data-message-id]');
  if (!target) return;
  event.preventDefault();
  openMessageMenu(target.dataset.messageId, event.clientX, event.clientY);
});
chatList.addEventListener('contextmenu', event => {
  const row = event.target.closest('[data-chat]');
  if (!row) return;
  event.preventDefault();
  openChatContextMenu(row.dataset.chat, event.clientX, event.clientY);
});
chatList.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch') return;
  const row = event.target.closest('[data-chat]');
  if (!row) return;
  clearTimeout(chatLongPressTimer);
  chatLongPressStart = { x:event.clientX, y:event.clientY, id:row.dataset.chat };
  chatLongPressTimer = setTimeout(() => {
    if (!chatLongPressStart) return;
    suppressChatClick = true;
    openChatContextMenu(chatLongPressStart.id, chatLongPressStart.x, chatLongPressStart.y);
    chatLongPressStart = null;
    setTimeout(() => { suppressChatClick = false; }, 900);
  }, 520);
});
chatList.addEventListener('pointermove', event => {
  if (!chatLongPressStart) return;
  if (Math.hypot(event.clientX - chatLongPressStart.x, event.clientY - chatLongPressStart.y) > 12) {
    clearTimeout(chatLongPressTimer);
    chatLongPressStart = null;
  }
});
for (const eventName of ['pointerup', 'pointercancel', 'pointerleave']) {
  chatList.addEventListener(eventName, () => {
    clearTimeout(chatLongPressTimer);
    chatLongPressStart = null;
  });
}
messages.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch') return;
  const target = event.target.closest('.album-tile[data-message-id], .message-row[data-message-id]');
  if (!target) return;
  clearTimeout(longPressTimer);
  longPressStart = { x: event.clientX, y: event.clientY, id: target.dataset.messageId };
  longPressTimer = setTimeout(() => {
    if (!longPressStart) return;
    suppressMessageClick = true;
    openMessageMenu(longPressStart.id, longPressStart.x, longPressStart.y);
    longPressStart = null;
    setTimeout(() => { suppressMessageClick = false; }, 900);
  }, 520);
});
messages.addEventListener('pointermove', event => {
  if (!longPressStart) return;
  if (Math.hypot(event.clientX - longPressStart.x, event.clientY - longPressStart.y) > 12) {
    clearTimeout(longPressTimer);
    longPressStart = null;
  }
});
for (const eventName of ['pointerup', 'pointercancel', 'pointerleave']) {
  messages.addEventListener(eventName, () => {
    clearTimeout(longPressTimer);
    longPressStart = null;
  });
}
document.getElementById('messageContextMenu').addEventListener('click', async event => {
  const action = event.target.closest('[data-message-action]')?.dataset.messageAction;
  if (!action) return;
  const messageId = document.getElementById('messageContextMenu').dataset.messageId;
  closeMessageMenu();
  if (action === 'reply') startReply(messageId);
  if (action === 'copy-image') await copyImage(messageId);
  if (action === 'copy') await copyMessage(messageId);
  if (action === 'delete') await deleteMessage(messageId);
});
document.getElementById('chatContextMenu').addEventListener('click', async event => {
  const action = event.target.closest('[data-chat-action]')?.dataset.chatAction;
  const chatId = document.getElementById('chatContextMenu').dataset.chatId;
  if (action && chatId) await handleChatMenuAction(action, chatId);
});
document.addEventListener('pointerdown', event => {
  const menu = document.getElementById('messageContextMenu');
  if (menu.classList.contains('open') && !menu.contains(event.target)) closeMessageMenu();
  const chatMenu = document.getElementById('chatContextMenu');
  if (chatMenu.classList.contains('open') && !chatMenu.contains(event.target)) closeChatContextMenu();
  if (!emojiPickerWrap.contains(event.target)) setEmojiPickerOpen(false);
});
messages.addEventListener('scroll', closeMessageMenu, { passive: true });
chatList.addEventListener('scroll', closeChatContextMenu, { passive:true });
document.getElementById('giftModalClose').addEventListener('click', closeGift);
document.getElementById('giftModal').addEventListener('click', event => {
  if (event.target.id === 'giftModal') closeGift();
});
document.getElementById('photoViewerClose').addEventListener('click', closePhotoViewer);
document.getElementById('photoViewerCloseTop').addEventListener('click', closePhotoViewer);
document.getElementById('photoViewerPrev').addEventListener('click', () => movePhotoViewer(-1));
document.getElementById('photoViewerNext').addEventListener('click', () => movePhotoViewer(1));
photoViewer.addEventListener('click', event => {
  if (event.target === photoViewer) closePhotoViewer();
});
photoViewerStage.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') photoViewerTouchStart = { x:event.clientX, y:event.clientY };
});
photoViewerStage.addEventListener('pointerup', event => {
  if (!photoViewerTouchStart) return;
  const deltaX = event.clientX - photoViewerTouchStart.x;
  const deltaY = event.clientY - photoViewerTouchStart.y;
  photoViewerTouchStart = null;
  if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) movePhotoViewer(deltaX < 0 ? 1 : -1);
});
photoViewerStage.addEventListener('pointercancel', () => { photoViewerTouchStart = null; });
document.getElementById('photoSendClose').addEventListener('click', closePhotoSend);
document.getElementById('photoSendCancel').addEventListener('click', closePhotoSend);
document.getElementById('photoSendChoose').addEventListener('click', () => document.getElementById('attachInput').click());
photoSendPreview.addEventListener('click', event => {
  const remove = event.target.closest('[data-remove-photo]');
  if (!remove) return;
  pendingPhotos.splice(Number(remove.dataset.removePhoto), 1);
  if (!pendingPhotos.length) return closePhotoSend();
  renderPhotoSendPreview();
});
photoSendModal.addEventListener('click', event => {
  if (event.target === photoSendModal) closePhotoSend();
});
document.getElementById('photoSendForm').addEventListener('submit', async event => {
  event.preventDefault();
  await sendPhotoSelection();
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
document.getElementById('chooseChatWallpaper').addEventListener('click', () => document.getElementById('chatWallpaperInput').click());
document.getElementById('chatWallpaperInput').addEventListener('change', event => {
  const file = event.currentTarget.files?.[0];
  event.currentTarget.value = '';
  if (file) chooseChatBackground(file);
});
document.getElementById('removeChatWallpaper').addEventListener('click', removeChatBackground);
document.getElementById('messageSearchButton').addEventListener('click', async () => {
  const query = await promptAction('Введите текст для поиска в текущей переписке.');
  if (!query?.trim()) return;
  const target = [...messages.querySelectorAll('.bubble')].find(bubble => bubble.textContent.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
  messages.querySelectorAll('.search-highlight').forEach(bubble => bubble.classList.remove('search-highlight'));
  if (!target) return showMessageToast('Сообщение не найдено');
  target.classList.add('search-highlight');
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.getElementById('attachButton').addEventListener('click', () => document.getElementById('attachInput').click());
document.getElementById('attachInput').addEventListener('change', event => {
  const files = [...(event.currentTarget.files || [])];
  event.currentTarget.value = '';
  openPhotoFiles(files);
});
emojiButton.addEventListener('click', () => setEmojiPickerOpen(!emojiPicker.classList.contains('open')));
emojiCategoriesElement.addEventListener('click', event => {
  const button = event.target.closest('[data-emoji-category]');
  if (!button) return;
  activeEmojiCategory = button.dataset.emojiCategory;
  emojiSearch.value = '';
  renderEmojiPicker();
});
emojiSearch.addEventListener('input', renderEmojiPicker);
emojiGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-emoji]');
  if (button) insertEmoji(button.dataset.emoji);
});
messageInput.addEventListener('paste', event => {
  const files = [...(event.clipboardData?.items || [])]
    .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter(Boolean);
  if (!files.length) return;
  event.preventDefault();
  openPhotoFiles(files);
});
messageInput.addEventListener('input', () => {
  if (!activeId || !messageInput.value.trim()) return;
  api(`/api/social/chats/${encodeURIComponent(activeId)}/presence`, { method: 'POST', body: JSON.stringify({ typing: true }) }).catch(() => {});
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    if (activeId) api(`/api/social/chats/${encodeURIComponent(activeId)}/presence`, { method: 'POST', body: JSON.stringify({ typing: false }) }).catch(() => {});
  }, 1600);
});
async function logout() {
  if (!await confirmAction('Выйти из Qwant Messenger?', { title: 'Выйти из аккаунта' })) return;
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
    closeBotManager();
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
    if (document.getElementById('botSettingsOverlay').classList.contains('open')) closeBotSettings();
    else closeBotManager();
    app.classList.remove('show-details');
  }
});

document.addEventListener('visibilitychange', () => {
  if (session?.sessionToken && !document.hidden) {
    checkDeviceSession();
    refreshChats();
    loadSettings();
  }
});

document.getElementById('settingsClose').addEventListener('click', closeSettings);
document.getElementById('settingsBack').addEventListener('click', () => {
  closeSettings();
  if (window.matchMedia('(max-width: 760px)').matches) openDrawer();
});
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
  if (photoViewer.classList.contains('open')) {
    if (event.key === 'Escape') closePhotoViewer();
    if (event.key === 'ArrowLeft') movePhotoViewer(-1);
    if (event.key === 'ArrowRight') movePhotoViewer(1);
    return;
  }
  if (event.key === 'Escape') closeSettings();
  if (event.key === 'Escape') closeGift();
  if (event.key === 'Escape') closePhotoSend();
  if (event.key === 'Escape') setEmojiPickerOpen(false);
  if (event.key === 'Escape') closeMessageMenu();
  if (event.key === 'Escape') closeChatContextMenu();
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
    await Promise.all([loadChats(), loadSettings(), loadOwnProfile()]);
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
  if (session?.sessionToken && !document.hidden) refreshChats();
}, 12000);
