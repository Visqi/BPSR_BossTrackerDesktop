const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  
  // Overlay controls
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),
  getOverlayStatus: () => ipcRenderer.invoke('get-overlay-status'),
  setOverlayOpacity: (opacity) => ipcRenderer.invoke('set-overlay-opacity', opacity),
  setOverlayPosition: (x, y) => ipcRenderer.invoke('set-overlay-position', x, y),
  
  // Boss subscription
  toggleBossSubscription: (bossId) => ipcRenderer.invoke('toggle-boss-subscription', bossId),
  getSubscribedBosses: () => ipcRenderer.invoke('get-subscribed-bosses'),
  isBossSubscribed: (bossId) => ipcRenderer.invoke('is-boss-subscribed', bossId),
  
  // Data API
  refreshData: () => ipcRenderer.invoke('refresh-data'),
  getBossChannels: (bossId) => ipcRenderer.invoke('get-boss-channels', bossId),
  getAliveChannels: (bossId) => ipcRenderer.invoke('get-alive-channels', bossId),
  getBosses: () => ipcRenderer.invoke('get-bosses'),
  requestInitialData: () => ipcRenderer.invoke('request-initial-data'),
  updateChannelHP: (bossId, channelNumber, hp, lastUpdate) => ipcRenderer.invoke('update-channel-hp', bossId, channelNumber, hp, lastUpdate),
  
  // Event listeners for realtime updates
  onBossDataLoaded: (callback) => {
    ipcRenderer.on('boss-data-loaded', (event, data) => callback(data));
  },
  onChannelDataLoaded: (callback) => {
    ipcRenderer.on('channel-data-loaded', () => callback());
  },
  onChannelUpdate: (callback) => {
    ipcRenderer.on('channel-update', (event, data) => callback(data));
  },
  onBossReset: (callback) => {
    ipcRenderer.on('boss-reset', (event, data) => callback(data));
  },
  onConnected: (callback) => {
    ipcRenderer.on('connected', () => callback());
  },
  onConnectionError: (callback) => {
    ipcRenderer.on('connection-error', (event, error) => callback(error));
  },
  onShowNotification: (callback) => {
    ipcRenderer.on('show-notification', (event, data) => callback(data));
  }
});
