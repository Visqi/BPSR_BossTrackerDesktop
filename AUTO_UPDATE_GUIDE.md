# Auto-Update Feature Documentation

## Overview

The BP Star Resonance application now includes an automatic update feature that checks for and installs updates from GitHub Releases. This ensures users always have the latest features and bug fixes.

## Features

- ✅ **Automatic Update Checks**: Checks for updates on startup (after 10 seconds) and every 4 hours
- ✅ **Manual Update Checks**: Users can manually check for updates via the footer button
- ✅ **User-Controlled Downloads**: Updates are not downloaded automatically; users are asked first
- ✅ **Progress Tracking**: Real-time download progress with visual feedback
- ✅ **Smart Installation**: Updates install automatically when the app is closed
- ✅ **Version Display**: Current version is shown in the footer
- ✅ **Development Mode Skip**: Auto-updater is disabled in development mode

## How It Works

### For Users

1. **Update Available**: When a new version is available, a notification appears in the bottom-right corner
2. **Download**: Click the notification or choose "Download Update" to begin downloading
3. **Install**: Once downloaded, you can either restart immediately or continue working
4. **Auto-Install on Quit**: The update will be installed automatically when you close the app

### Update Notification Flow

```
1. App starts → Check for updates after 10 seconds
2. Update found → Show "Update Available" notification
3. User clicks → Download begins with progress bar
4. Download complete → Show "Update Ready" notification
5. User restarts → Update installs automatically
```

## For Developers

### Publishing Updates

To publish a new version and trigger auto-updates:

#### 1. Update Version Number

Edit `package.json`:
```json
{
  "version": "1.1.0"
}
```

#### 2. Build the Application

```powershell
# Build both portable and installer versions
npm run build

# Or build specific versions
npm run build:portable
npm run build:installer
```

This creates files in the `dist` folder:
- `BPSR Creature Tracker.exe` (portable)
- `BPSR-Tracker-Setup.exe` (installer)
- `latest.yml` (update metadata - IMPORTANT!)

#### 3. Create GitHub Release

1. Go to GitHub repository: `https://github.com/Visqi/bpsr_bptimer_desktop`
2. Click "Releases" → "Create a new release"
3. Tag: `v1.1.0` (must match package.json version with 'v' prefix)
4. Title: `Version 1.1.0` (or descriptive title)
5. Description: Add release notes
6. Upload files:
   - `BPSR Creature Tracker.exe`
   - `BPSR-Tracker-Setup.exe`
   - `latest.yml` ⚠️ **REQUIRED** - This file tells the auto-updater about the new version
7. Click "Publish release"

#### 4. Verify

After publishing:
- Users running older versions will be notified of the update
- The `latest.yml` file on GitHub will be checked automatically
- Download will pull from your GitHub release assets

### Configuration

#### package.json

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "Visqi",
        "repo": "bpsr_bptimer_desktop"
      }
    ]
  }
}
```

This tells `electron-updater` where to look for updates.

#### Auto-Updater Settings

In `src/utils/auto-updater.js`:

```javascript
autoUpdater.autoDownload = false;       // Don't auto-download
autoUpdater.autoInstallOnAppQuit = true; // Install when app quits
```

**Update Check Intervals**:
- Initial check: 10 seconds after startup
- Periodic checks: Every 4 hours

To modify, edit `src/utils/auto-updater.js`:
```javascript
// Initial check delay
setTimeout(() => {
  this.checkForUpdates();
}, 10000); // 10 seconds

// Periodic checks
setInterval(() => {
  this.checkForUpdates();
}, 4 * 60 * 60 * 1000); // 4 hours
```

### File Structure

```
src/
├── utils/
│   └── auto-updater.js          # Auto-updater module
├── main.js                       # Initializes auto-updater
├── preload.js                    # Exposes update APIs
└── windows/main/
    ├── index.html                # Update UI elements
    ├── styles.css                # Update notification styles
    └── renderer.js               # Update event handlers
```

### IPC Methods

Available to renderer processes via `window.electronAPI`:

```javascript
// Check for updates manually
await window.electronAPI.checkForUpdates();

// Download update
await window.electronAPI.downloadUpdate();

// Install update and restart
await window.electronAPI.installUpdate();

// Get current version
const version = await window.electronAPI.getAppVersion();
```

### Events

Listen for update events:

```javascript
// Update is available
window.electronAPI.onUpdateAvailable((info) => {
  console.log('New version:', info.version);
  console.log('Release notes:', info.releaseNotes);
});

// Download started
window.electronAPI.onUpdateDownloading(() => {
  // Show loading indicator
});

// Download progress
window.electronAPI.onUpdateDownloadProgress((progress) => {
  console.log('Progress:', progress.percent + '%');
});

// Download complete
window.electronAPI.onUpdateDownloaded((info) => {
  console.log('Ready to install:', info.version);
});

// Error occurred
window.electronAPI.onUpdateError((error) => {
  console.error('Update error:', error.message);
});
```

## Testing

### Test in Development

The auto-updater is **disabled** in development mode to prevent conflicts. To test:

1. Build a production version:
   ```powershell
   npm run build:portable
   ```

2. Run the built executable from `dist/`

3. Create a test release on GitHub with a higher version number

4. The app should detect and offer the update

### Manual Testing Checklist

- [ ] App shows current version in footer
- [ ] "Check for Updates" button works
- [ ] Update notification appears when update is available
- [ ] Download progress shows correctly
- [ ] "Restart to Install" notification appears after download
- [ ] App installs update on restart
- [ ] "No updates" dialog shows when up-to-date

## Troubleshooting

### Updates Not Detected

**Possible causes**:
1. `latest.yml` not included in GitHub release
2. Version in `package.json` doesn't match Git tag
3. Git tag doesn't have 'v' prefix (should be `v1.1.0`, not `1.1.0`)
4. GitHub release is a draft or pre-release

**Solution**: Verify all release files and version numbers match.

### Download Fails

**Possible causes**:
1. Network connectivity issues
2. GitHub API rate limiting
3. Release assets not publicly accessible

**Solution**: Check GitHub release settings and network connection.

### Development Mode Issues

If auto-updater runs in development:

```javascript
// In src/main.js
if (!process.argv.includes('--dev') && process.env.NODE_ENV !== 'development') {
  autoUpdater = new AutoUpdater(mainWindow);
}
```

Ensure you're running with `npm run dev` or `--dev` flag.

## Security

- Updates are downloaded over HTTPS from GitHub
- `electron-updater` verifies code signatures (when configured)
- Only releases from the configured repository are accepted
- No automatic installation without user confirmation

## Best Practices

1. **Always test updates** before releasing to users
2. **Include release notes** in GitHub releases
3. **Use semantic versioning** (MAJOR.MINOR.PATCH)
4. **Keep `latest.yml`** in every release
5. **Monitor update adoption** through analytics (if implemented)
6. **Provide rollback plan** in case of critical bugs

## Future Enhancements

Potential improvements:
- Delta updates (download only changed files)
- Multiple update channels (stable, beta, nightly)
- Update scheduler (allow users to choose update time)
- Release notes viewer in-app
- Silent updates option for minor versions
- Rollback to previous version

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Electron Builder Publishing](https://www.electron.build/configuration/publish)
- [GitHub Releases Guide](https://docs.github.com/en/repositories/releasing-projects-on-github)

## Support

For issues related to auto-updates:
1. Check GitHub Issues: `https://github.com/Visqi/bpsr_bptimer_desktop/issues`
2. Verify release configuration
3. Check console logs in DevTools (development mode)
4. Contact: Visqi or Wohee
