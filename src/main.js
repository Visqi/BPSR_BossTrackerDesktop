const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const APIService = require('./services/api-service');
const AutoUpdater = require('./utils/auto-updater');

let mainWindow = null;
let overlayWindow = null;
let apiService = null;
let autoUpdater = null;

// AppData storage paths
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// Load settings from AppData
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return { subscribedBosses: [] };
}

// Save settings to AppData
function saveSettings(settings) {
  try {
    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// In-memory settings
let appSettings = loadSettings();

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    title: 'Blue Protocol Star Resonance - Boss Timer',
    icon: path.join(__dirname, '../app-icon.ico')
  });

  mainWindow.loadFile(path.join(__dirname, 'windows/main/index.html'));

  mainWindow.on('closed', () => {
    // Close the overlay when main window closes
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.close();
    }
    mainWindow = null;
  });

  // Forward renderer console logs to main process console
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levelMap = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    console.log(`[Renderer ${levelMap[level]}]:`, message);
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  overlayWindow.loadFile(path.join(__dirname, 'windows/overlay/index.html'));
  overlayWindow.setIgnoreMouseEvents(false);
  
  // Prevent the overlay from losing always-on-top status when clicked
  overlayWindow.on('blur', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });
  
  // Ensure overlay stays on top after focus
  overlayWindow.on('focus', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    overlayWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Initialize API Service
  apiService = new APIService();
  
  // Create main window
  createMainWindow();
  
  // Initialize auto-updater (only in production)
  if (!process.argv.includes('--dev') && process.env.NODE_ENV !== 'development') {
    autoUpdater = new AutoUpdater(mainWindow);
    console.log('Auto-updater initialized');
  } else {
    console.log('Auto-updater disabled in development mode');
  }
  
  // Load boss data
  // Note: Realtime SSE connection is now handled in the renderer process
  // using the browser's native EventSource API for better compatibility
  apiService.loadBossData().then(() => {
    console.log('Boss data loaded');
    // apiService.connectRealtime(); // Disabled - using renderer SSE instead
  }).catch(error => {
    console.error('Failed to load boss data:', error);
  });

  // Forward API events to renderers
  apiService.on('boss-data-loaded', (bosses) => {
    if (mainWindow) {
      mainWindow.webContents.send('boss-data-loaded', bosses);
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('boss-data-loaded', bosses);
    }
  });

  apiService.on('channel-data-loaded', () => {
    if (mainWindow) {
      mainWindow.webContents.send('channel-data-loaded');
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('channel-data-loaded');
    }
  });

  apiService.on('channel-update', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('channel-update', data);
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('channel-update', data);
    }
  });

  apiService.on('boss-reset', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('boss-reset', data);
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('boss-reset', data);
    }
  });

  apiService.on('connected', () => {
    if (mainWindow) {
      mainWindow.webContents.send('connected');
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('connected');
    }
  });

  apiService.on('connection-error', (error) => {
    if (mainWindow) {
      mainWindow.webContents.send('connection-error', error);
    }
    if (overlayWindow) {
      overlayWindow.webContents.send('connection-error', error);
    }
  });
});

// IPC Handlers

// Window controls
ipcMain.handle('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.handle('window-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
      return false;
    } else {
      win.maximize();
      return true;
    }
  }
  return false;
});

ipcMain.handle('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

ipcMain.handle('toggle-overlay', () => {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
    return false;
  } else {
    createOverlayWindow();
    // Send current data to overlay when ready
    if (apiService) {
      overlayWindow.webContents.on('did-finish-load', () => {
        const bosses = apiService.getBosses();
        overlayWindow.webContents.send('boss-data-loaded', bosses);
        overlayWindow.webContents.send('channel-data-loaded');
      });
    }
    return true;
  }
});

ipcMain.handle('get-overlay-status', () => {
  return overlayWindow !== null;
});

ipcMain.handle('refresh-data', async () => {
  if (apiService) {
    await apiService.loadBossData();
    return true;
  }
  return false;
});

ipcMain.handle('get-boss-channels', (event, bossId) => {
  if (apiService) {
    return apiService.getBossChannels(bossId);
  }
  return [];
});

ipcMain.handle('get-alive-channels', (event, bossId) => {
  if (apiService) {
    return apiService.getAliveChannels(bossId);
  }
  return [];
});

ipcMain.handle('get-bosses', () => {
  if (apiService) {
    return apiService.getBosses();
  }
  return [];
});

ipcMain.handle('update-channel-hp', (event, bossId, channelNumber, hp, lastUpdate, locationImage, locationId) => {
  if (apiService) {
    const key = `${bossId}_${channelNumber}`;
    const existingData = apiService.channelStatusMap.get(key);
    
    // Update the channel data in-memory
    const channelData = {
      bossId,
      channelNumber,
      hp,
      lastUpdate,
      status: apiService.getChannelStatus(hp, lastUpdate)
    };
    
    // Add location_image if present (for magical creatures)
    if (locationImage != null) {
      channelData.locationImage = locationImage;
    }
    
    // Add location_id if present (for magical creatures with location-based spawns)
    if (locationId != null) {
      channelData.locationId = locationId;
    }
    
    apiService.channelStatusMap.set(key, channelData);
    
    console.log(`Updated channel ${channelNumber} for boss ${bossId}: HP ${hp}%${locationId != null ? ' (location: ' + locationId + ')' : ''}`);
    return true;
  }
  return false;
});

ipcMain.handle('request-initial-data', () => {
  console.log('Renderer requested initial data');
  if (apiService && apiService.bossData && apiService.bossData.length > 0) {
    console.log('Sending initial data to renderer:', apiService.bossData.length, 'bosses');
    // Send boss data event
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('boss-data-loaded', apiService.bossData);
    }
    // Send channel data event if loaded
    if (apiService.channelStatusMap && apiService.channelStatusMap.size > 0) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('channel-data-loaded');
      }
    }
    return { success: true, bossCount: apiService.bossData.length };
  }
  console.log('Initial data not yet available');
  return { success: false, message: 'Data not loaded yet' };
});

ipcMain.handle('set-overlay-opacity', (event, opacity) => {
  if (overlayWindow) {
    overlayWindow.setOpacity(opacity);
  }
});

ipcMain.handle('set-overlay-position', (event, x, y) => {
  if (overlayWindow) {
    overlayWindow.setPosition(x, y);
  }
});

// Boss subscription management
ipcMain.handle('toggle-boss-subscription', (event, bossId) => {
  if (!appSettings.subscribedBosses) {
    appSettings.subscribedBosses = [];
  }
  
  const index = appSettings.subscribedBosses.indexOf(bossId);
  if (index > -1) {
    appSettings.subscribedBosses.splice(index, 1);
    saveSettings(appSettings);
    return false;
  } else {
    appSettings.subscribedBosses.push(bossId);
    saveSettings(appSettings);
    return true;
  }
});

ipcMain.handle('get-subscribed-bosses', () => {
  return appSettings.subscribedBosses || [];
});

ipcMain.handle('is-boss-subscribed', (event, bossId) => {
  return (appSettings.subscribedBosses || []).includes(bossId);
});

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', async () => {
  if (autoUpdater) {
    return await autoUpdater.manualCheckForUpdates();
  }
  return null;
});

ipcMain.handle('download-update', () => {
  if (autoUpdater) {
    autoUpdater.downloadUpdate();
    return true;
  }
  return false;
});

ipcMain.handle('install-update', () => {
  if (autoUpdater) {
    autoUpdater.quitAndInstall();
    return true;
  }
  return false;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Open external URL in default browser
ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
});

// Send notifications for subscribed bosses with low HP channels
function checkSubscribedBossNotifications() {
  if (!apiService) return;
  
  const subscribedBosses = appSettings.subscribedBosses || [];
  subscribedBosses.forEach(bossId => {
    const channels = apiService.getAliveChannels(bossId);
    const boss = apiService.getBosses().find(b => b.id === bossId);
    
    if (!boss) return;
    
    // Notify for critical HP channels (below 30%)
    const criticalChannels = channels.filter(ch => ch.hp > 0 && ch.hp < 30);
    if (criticalChannels.length > 0) {
      const channelNumbers = criticalChannels.map(ch => ch.channelNumber).join(', ');
      sendNotification(
        'Critical HP Alert',
        `${boss.name} has ${criticalChannels.length} channel(s) with critical HP: ${channelNumbers}`
      );
    }
  });
}

function sendNotification(title, body) {
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', { title, body });
  }
}

// Check notifications every 30 seconds
setInterval(checkSubscribedBossNotifications, 30000);

app.on('window-all-closed', () => {
  if (apiService) {
    apiService.disconnect();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
