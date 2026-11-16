const { app, BrowserWindow, session, shell } = require('electron');
const path = require('node:path');

const serverUrl = new URL(process.env.QWANT_MESSENGER_URL || 'https://qwant-two.vercel.app/');
const splashPath = path.join(__dirname, 'splash.html');
const loadTimeoutMs = 15000;

if (serverUrl.protocol !== 'https:') throw new Error('Messenger desktop requires an HTTPS server URL.');

function openExternal(value) {
  try {
    const url = new URL(value);
    if (['https:', 'http:'].includes(url.protocol)) shell.openExternal(url.href).catch(() => {});
  } catch {}
}

function isMessengerUrl(value) {
  try {
    return new URL(value).origin === serverUrl.origin;
  } catch {
    return false;
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    show: true,
    autoHideMenuBar: true,
    backgroundColor: '#101820',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, value) => {
    if (value === 'qwant-messenger://retry') {
      event.preventDefault();
      loadRemote();
      return;
    }
    if (isMessengerUrl(value)) return;
    event.preventDefault();
    openExternal(value);
  });
  let loadTimer;
  let loadingRemote = false;
  const showSplash = state => {
    clearTimeout(loadTimer);
    loadingRemote = false;
    if (window.isDestroyed()) return;
    window.webContents.stop();
    window.loadFile(splashPath, { query: { state } }).catch(() => {});
  };
  const loadRemote = () => {
    if (window.isDestroyed()) return;
    clearTimeout(loadTimer);
    loadingRemote = true;
    loadTimer = setTimeout(() => showSplash('slow'), loadTimeoutMs);
    window.loadURL(serverUrl.href).catch(() => {
      if (loadingRemote) showSplash('error');
    });
  };
  window.webContents.on('did-fail-load', (_event, code, _description, _url, isMainFrame) => {
    if (isMainFrame && code !== -3 && loadingRemote) showSplash('error');
  });
  window.webContents.on('did-finish-load', () => {
    if (!isMessengerUrl(window.webContents.getURL())) return;
    clearTimeout(loadTimer);
    loadingRemote = false;
  });
  window.loadFile(splashPath).then(() => {
    if (window.isDestroyed()) return;
    loadRemote();
  }).catch(() => {});
}

const hasSingleInstance = app.requestSingleInstanceLock();

if (!hasSingleInstance) {
  app.quit();
} else {
  app.setAppUserModelId('com.ferniex.qwant.messenger');
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows();
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
  app.whenReady().then(() => {
    session.defaultSession.setPermissionCheckHandler((_webContents, permission, requestingOrigin, details) => (
      isMessengerUrl(requestingOrigin)
      && (permission === 'speaker-selection' || permission === 'media' && details.mediaType === 'audio')
    ));
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
      const trustedOrigin = isMessengerUrl(details.securityOrigin || webContents.getURL());
      callback(trustedOrigin && (permission === 'speaker-selection'
        || permission === 'media' && details.mediaTypes?.length === 1 && details.mediaTypes[0] === 'audio'));
    });
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
