const { autoUpdater } = require('electron-updater');
const { ipcMain, dialog } = require('electron');

let mainWindowRef = null;
let updateAvailableInfo = null;

function sendStatusToWindow(status, payload = {}) {
  console.log(`[AutoUpdater] ${status}`, payload);
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send('update:status', {
      status,
      ...payload,
      timestamp: new Date().toISOString()
    });
  }
}

function initAutoUpdater(mainWindow) {
  mainWindowRef = mainWindow;

  // Configuration
  autoUpdater.autoDownload = true; // Automatically download update in background
  autoUpdater.autoInstallOnAppQuit = true; // Automatically install when app is closed

  // Event handlers
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('checking', { message: 'Checking for remote updates...' });
  });

  autoUpdater.on('update-available', (info) => {
    updateAvailableInfo = info;
    sendStatusToWindow('available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
      message: `Update v${info.version} is available. Downloading in background...`
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('not-available', {
      version: info.version,
      message: 'App is up to date.'
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err);
    sendStatusToWindow('error', {
      message: err == null ? 'Unknown update error' : (err.message || err).toString()
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendStatusToWindow('downloading', {
      percent: Math.round(progressObj.percent || 0),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
      message: `Downloading update: ${Math.round(progressObj.percent || 0)}%`
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('downloaded', {
      version: info.version,
      message: `Update v${info.version} downloaded and ready to install.`
    });
  });

  // Check for updates on startup (after 5 seconds so app UI loads first)
  setTimeout(() => {
    checkForUpdatesSilently();
  }, 5000);

  // Periodically check for updates every 4 hours
  setInterval(() => {
    checkForUpdatesSilently();
  }, 4 * 60 * 60 * 1000);
}

function checkForUpdatesSilently() {
  try {
    console.log('[AutoUpdater] Checking for remote updates from GitHub...');
    autoUpdater.checkForUpdates().catch((err) => {
      console.warn('[AutoUpdater] Silent update check failed (offline or dev):', err.message);
    });
  } catch (err) {
    console.warn('[AutoUpdater] Error in silent update check:', err.message);
  }
}

// IPC Handlers
function setupUpdaterIpc() {
  ipcMain.handle('app:check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('app:start-download', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('app:install-update', () => {
    console.log('[AutoUpdater] Quitting and installing update...');
    autoUpdater.quitAndInstall(false, true);
  });
}

module.exports = {
  initAutoUpdater,
  setupUpdaterIpc,
  checkForUpdatesSilently
};
