const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  // App version
  getVersion: () => ipcRenderer.invoke('app:get-version'),

  // Updater commands
  checkForUpdates: () => ipcRenderer.invoke('app:check-for-updates'),
  startDownload: () => ipcRenderer.invoke('app:start-download'),
  installUpdate: () => ipcRenderer.invoke('app:install-update'),

  // Listeners for update events
  onUpdateStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:status', handler);
    return () => ipcRenderer.removeListener('update:status', handler);
  },

  // Window controls (optional minimize/maximize/close)
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Web Bluetooth Device Chooser (for thermal receipt printers)
  onBluetoothDevicesFound: (callback) => {
    const handler = (_event, deviceList) => callback(deviceList);
    ipcRenderer.on('bluetooth:devices-found', handler);
    return () => ipcRenderer.removeListener('bluetooth:devices-found', handler);
  },
  selectBluetoothDevice: (deviceId) => ipcRenderer.send('bluetooth:select-device', deviceId),
  cancelBluetoothDevice: () => ipcRenderer.send('bluetooth:cancel')
});
