const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { initAutoUpdater, setupUpdaterIpc } = require('./updater');
const { startNextServer, checkPortAvailable, loadEnvironment, logToFile } = require('./server');

// Enable Chromium Web Bluetooth flags for Electron
app.commandLine.appendSwitch('enable-web-bluetooth', 'true');
app.commandLine.appendSwitch('enable-experimental-web-platform-features', 'true');

process.on('uncaughtException', (err) => {
  const msg = `[CRITICAL UNCAUGHT EXCEPTION] ${err?.stack || err}`;
  console.error(msg);
  if (logToFile) logToFile(msg);
});

process.on('unhandledRejection', (reason) => {
  const msg = `[UNHANDLED PROMISE REJECTION] ${reason?.stack || reason}`;
  console.error(msg);
  if (logToFile) logToFile(msg);
});

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[Electron] Another instance is already running. Quitting.');
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let splashWindow = null;
let nextServerInstance = null;
let bluetoothSelectCallback = null;

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const APP_DIR = path.join(__dirname, '..');

// Load environment variables immediately
loadEnvironment(APP_DIR);

function getAppIcon() {
  const candidates = [
    path.join(__dirname, 'logo.png'),
    path.join(__dirname, 'icon.ico'),
    path.join(APP_DIR, 'app', 'favicon.ico'),
    path.join(APP_DIR, 'public', 'logo.png'),
    path.join(APP_DIR, 'app', 'web-app-manifest-512x512.png')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(APP_DIR, 'app', 'favicon.ico');
}

const ICON_PATH = getAppIcon();

// Create the splash window for smooth startup
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 440,
    height: 340,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    icon: ICON_PATH,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.center();
}

// Create the main application window
function createMainWindow(loadUrl) {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    show: false, // Don't show until ready
    title: 'Gpower CRM',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Remove default menu bar in production
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }

  // Allow toggling DevTools with F12 or Ctrl+Shift+I
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Handle external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  // Web Bluetooth Device Selection handler (discovers thermal Bluetooth printers)
  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    bluetoothSelectCallback = callback;
    console.log('[Electron Bluetooth] Discovered devices:', deviceList.map(d => ({ name: d.deviceName, id: d.deviceId })));

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('bluetooth:devices-found', deviceList);
    }
  });

  // Handle Windows Bluetooth pairing (PIN entry for receipt printers)
  mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
    console.log('[Electron Bluetooth] Pairing request received:', details.deviceName, details.pairingKind);
    if (details.pairingKind === 'providePin') {
      // Standard thermal receipt printer PINs: '0000' or '1234'
      callback({ confirmed: true, pin: '0000' });
    } else {
      callback({ confirmed: true });
    }
  });

  // Load the application URL
  console.log(`[Electron] Loading URL: ${loadUrl}`);
  mainWindow.loadURL(loadUrl);

  // Show window once content is ready
  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.focus();

    // Initialize Auto-Updater only in packaged app
    if (!isDev) {
      initAutoUpdater(mainWindow);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Helper to poll until the server is ready
function waitForServer(url, timeoutMs = 45000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for server at ${url}`));
      } else {
        setTimeout(check, 400);
      }
    };

    check();
  });
}

// Window control IPC handlers
function setupWindowIpc() {
  ipcMain.handle('app:get-version', () => app.getVersion());

  ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  // Bluetooth device selection from custom UI
  ipcMain.on('bluetooth:select-device', (event, deviceId) => {
    console.log('[Electron Bluetooth] Device selected by user:', deviceId);
    if (bluetoothSelectCallback) {
      bluetoothSelectCallback(deviceId);
      bluetoothSelectCallback = null;
    }
  });

  ipcMain.on('bluetooth:cancel', () => {
    console.log('[Electron Bluetooth] Selection cancelled by user');
    if (bluetoothSelectCallback) {
      bluetoothSelectCallback('');
      bluetoothSelectCallback = null;
    }
  });
}

// Application startup
app.whenReady().then(async () => {
  setupWindowIpc();
  setupUpdaterIpc();

  let targetUrl = 'http://127.0.0.1:3000';

  if (isDev) {
    // In development mode, Next.js dev server is started concurrently
    console.log('[Electron Dev] Waiting for Next.js dev server on http://127.0.0.1:3000...');
    createSplashWindow();
    try {
      await waitForServer('http://127.0.0.1:3000');
      createMainWindow('http://127.0.0.1:3000');
    } catch (err) {
      console.error('[Electron Dev] Failed to connect to dev server:', err);
      if (splashWindow) splashWindow.close();
    }
  } else {
    // In production, start the embedded Next.js server
    createSplashWindow();
    try {
      console.log('[Electron Prod] Launching internal Next.js server...');
      const { server, url } = await startNextServer({
        appDir: APP_DIR,
        preferredPort: 3000
      });
      nextServerInstance = server;
      targetUrl = url;

      await waitForServer(targetUrl);
      createMainWindow(targetUrl);
    } catch (err) {
      console.error('[Electron Prod] Failed to start internal Next.js server:', err);
      if (splashWindow) splashWindow.close();
      app.quit();
    }
  }

  // Second instance focus
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(targetUrl);
    }
  });
});

// Clean server shutdown when app quits
function cleanupServer() {
  if (nextServerInstance) {
    console.log('[Electron] Shutting down internal Next.js server...');
    try {
      nextServerInstance.close();
    } catch (e) {
      console.error('[Electron] Error closing server:', e);
    }
    nextServerInstance = null;
  }
}

app.on('before-quit', cleanupServer);
app.on('will-quit', cleanupServer);

app.on('window-all-closed', () => {
  cleanupServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
