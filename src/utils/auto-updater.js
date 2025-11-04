const { autoUpdater } = require('electron-updater');
const { dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');

class AutoUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.updateAvailable = false;
    this.isPortable = this.checkIfPortable();
    
    if (this.isPortable) {
      console.log('Portable build detected - Auto-updates are not supported for portable executables');
      console.log('Please download new versions manually from GitHub releases');
      return;
    }
    
    console.log('Auto-updater initialized for installer build');
    this.setupAutoUpdater();
  }

  checkIfPortable() {
    // Check if app-update.yml exists (only present in NSIS installs)
    const updateYmlPath = path.join(process.resourcesPath, 'app-update.yml');
    const exists = fs.existsSync(updateYmlPath);
    
    // If app-update.yml doesn't exist, this is a portable build
    return !exists;
  }

  setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false; // Don't auto-download, ask user first
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates on startup (after 10 seconds)
    setTimeout(() => {
      this.checkForUpdates();
    }, 10000);

    // Check for updates every 4 hours
    setInterval(() => {
      this.checkForUpdates();
    }, 4 * 60 * 60 * 1000);

    // Event: Update available
    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      this.updateAvailable = true;
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-available', {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes
        });
      }

      // Show dialog to user
      this.showUpdateDialog(info);
    });

    // Event: Update not available
    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available. Current version is up to date.');
      this.updateAvailable = false;
    });

    // Event: Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      console.log(logMessage);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-download-progress', {
          percent: Math.round(progressObj.percent),
          transferred: progressObj.transferred,
          total: progressObj.total
        });
      }
    });

    // Event: Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info.version);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-downloaded', {
          version: info.version
        });
      }

      // Show dialog to restart
      this.showRestartDialog(info);
    });

    // Event: Error
    autoUpdater.on('error', (error) => {
      console.error('Auto-updater error:', error);
      
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-error', {
          message: error.message
        });
      }
    });
  }

  async checkForUpdates() {
    if (this.isPortable) {
      console.log('Skipping update check - portable build');
      return;
    }
    
    try {
      console.log('Checking for updates...');
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  showUpdateDialog(info) {
    const dialogOpts = {
      type: 'info',
      buttons: ['Download Update', 'Later'],
      title: 'Update Available',
      message: `Version ${info.version} is available`,
      detail: `A new version of BP Star Resonance is available. Would you like to download it now?\n\nCurrent version: ${require('electron').app.getVersion()}\nNew version: ${info.version}`
    };

    dialog.showMessageBox(this.mainWindow, dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        // User clicked "Download Update"
        console.log('User initiated update download');
        autoUpdater.downloadUpdate();
        
        // Show downloading notification
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('update-downloading');
        }
      }
    });
  }

  showRestartDialog(info) {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart Now', 'Later'],
      title: 'Update Ready',
      message: 'Update Downloaded',
      detail: `Version ${info.version} has been downloaded. The application will be updated when you restart.\n\nWould you like to restart now?`
    };

    dialog.showMessageBox(this.mainWindow, dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        // User clicked "Restart Now"
        console.log('User initiated restart for update');
        autoUpdater.quitAndInstall(false, true);
      }
    });
  }

  // Manual check triggered by user
  async manualCheckForUpdates() {
    if (this.isPortable) {
      // Show portable build message
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Portable Build',
        message: 'Auto-updates are not available for portable builds',
        detail: `Current version: ${require('electron').app.getVersion()}\n\nPlease download new versions manually from:\nhttps://github.com/Visqi/BPSR_BossTrackerDesktop/releases`
      });
      return null;
    }
    
    try {
      console.log('Manual update check triggered');
      const result = await autoUpdater.checkForUpdates();
      
      if (!this.updateAvailable) {
        // No update available, show dialog
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'No Updates',
          message: 'You are running the latest version',
          detail: `Current version: ${require('electron').app.getVersion()}`
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error checking for updates:', error);
      
      dialog.showMessageBox(this.mainWindow, {
        type: 'error',
        title: 'Update Check Failed',
        message: 'Failed to check for updates',
        detail: error.message
      });
    }
  }

  downloadUpdate() {
    if (this.isPortable) {
      console.log('Skipping download - portable build');
      return;
    }
    autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    if (this.isPortable) {
      console.log('Skipping install - portable build');
      return;
    }
    autoUpdater.quitAndInstall(false, true);
  }
}

module.exports = AutoUpdater;
