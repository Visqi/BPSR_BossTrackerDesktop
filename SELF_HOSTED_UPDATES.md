# Self-Hosted Update Server Guide

## Overview

This guide explains how to host application updates on your own server instead of using GitHub Releases. This gives you complete control over the update distribution process.

## Configuration

### 1. Update package.json

The app is already configured to use a generic server. Update the URL in `package.json`:

```json
{
  "build": {
    "publish": [
      {
        "provider": "generic",
        "url": "https://yourdomain.com/updates"
      }
    ]
  }
}
```

**Important**: Change `https://yourdomain.com/updates` to your actual server URL.

### Alternative Configurations

#### Using Multiple Servers (Fallback)
```json
"publish": [
  {
    "provider": "generic",
    "url": "https://primary-server.com/updates"
  },
  {
    "provider": "generic",
    "url": "https://backup-server.com/updates"
  }
]
```

#### Mixed: Own Server + GitHub
```json
"publish": [
  {
    "provider": "generic",
    "url": "https://yourdomain.com/updates"
  },
  {
    "provider": "github",
    "owner": "Visqi",
    "repo": "bpsr_bptimer_desktop"
  }
]
```

## Server Setup

### Required Files Structure

Your server must host these files in a specific structure:

```
https://yourdomain.com/updates/
├── latest.yml                              # Update metadata (REQUIRED)
├── BPSR-Creature-Tracker-1.1.0.exe        # Portable version
└── BPSR-Tracker-Setup-1.1.0.exe           # Installer version
```

### File: latest.yml

This is the **most important file**. It tells the app about available updates.

**Example `latest.yml`:**

```yaml
version: 1.1.0
files:
  - url: BPSR-Creature-Tracker-1.1.0.exe
    sha512: [base64-encoded-hash]
    size: 125829632
  - url: BPSR-Tracker-Setup-1.1.0.exe
    sha512: [base64-encoded-hash]
    size: 125829632
path: BPSR-Creature-Tracker-1.1.0.exe
sha512: [base64-encoded-hash]
releaseDate: '2025-11-04T10:30:00.000Z'
```

**Good news**: `electron-builder` automatically generates this file when you build! You just need to upload it.

## Deployment Process

### Step 1: Build Your Application

```powershell
# Build the application
npm run build
```

This creates files in the `dist/` folder:
- `BPSR Creature Tracker.exe` (portable)
- `BPSR-Tracker-Setup.exe` (installer)
- `latest.yml` ⚠️ **CRITICAL FILE**
- Other build artifacts

### Step 2: Prepare Files for Upload

From the `dist/` folder, you need:

1. **`latest.yml`** - The update manifest
2. **Executable files** - Both portable and/or installer versions

**Rename files** (optional but recommended for versioning):
```
BPSR Creature Tracker.exe  →  BPSR-Creature-Tracker-1.1.0.exe
BPSR-Tracker-Setup.exe     →  BPSR-Tracker-Setup-1.1.0.exe
```

Or use the originals - the `latest.yml` file contains the correct filenames.

### Step 3: Upload to Your Server

Upload these files to your web server at the URL you specified in `package.json`.

**Example using FTP/SFTP:**
```
Local: dist/latest.yml
Remote: /public/updates/latest.yml

Local: dist/BPSR Creature Tracker.exe
Remote: /public/updates/BPSR Creature Tracker.exe
```

**Example using cURL (if your server has an API):**
```powershell
curl -X POST -F "file=@dist/latest.yml" https://yourdomain.com/api/upload
curl -X POST -F "file=@dist/BPSR Creature Tracker.exe" https://yourdomain.com/api/upload
```

### Step 4: Verify Files Are Accessible

Test that the files are publicly accessible:

```
https://yourdomain.com/updates/latest.yml
https://yourdomain.com/updates/BPSR Creature Tracker.exe
```

Open these URLs in a browser - they should download the files.

## Server Requirements

### Web Server Configuration

#### Apache (.htaccess)

```apache
# Enable CORS (if needed)
Header set Access-Control-Allow-Origin "*"

# Set correct MIME types
AddType application/x-yaml .yml
AddType application/x-yaml .yaml
AddType application/octet-stream .exe

# Enable range requests for large files
Header set Accept-Ranges bytes
```

#### Nginx

```nginx
location /updates/ {
    # Enable CORS (if needed)
    add_header Access-Control-Allow-Origin *;
    
    # Enable range requests
    add_header Accept-Ranges bytes;
    
    # Set correct MIME types
    types {
        application/x-yaml yml yaml;
        application/octet-stream exe;
    }
    
    # Disable caching for latest.yml
    location ~* latest\.yml$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
```

#### Node.js/Express Example

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve updates directory
app.use('/updates', express.static('updates', {
  // Disable caching for latest.yml
  setHeaders: (res, path) => {
    if (path.endsWith('latest.yml')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.listen(3000);
```

### HTTPS Requirement

⚠️ **Important**: Your server **must use HTTPS** for security. Electron will not download updates over HTTP in production.

### Bandwidth Considerations

- Each user update downloads the full executable (~120MB+)
- Estimate: 100 users × 120MB = 12GB bandwidth per update
- Consider using a CDN for large-scale distribution

## Using Your Own Update Server (BPTimer API)

Since you already have `db.bptimer.com`, you could host updates there!

### Example Setup

1. **Create updates directory** on your server:
   ```
   /var/www/bptimer/updates/
   ```

2. **Update package.json**:
   ```json
   "publish": [
     {
       "provider": "generic",
       "url": "https://db.bptimer.com/updates"
     }
   ]
   ```

3. **Upload files** after each build:
   ```bash
   scp dist/latest.yml server:/var/www/bptimer/updates/
   scp dist/BPSR\ Creature\ Tracker.exe server:/var/www/bptimer/updates/
   ```

4. **Access via**:
   ```
   https://db.bptimer.com/updates/latest.yml
   https://db.bptimer.com/updates/BPSR Creature Tracker.exe
   ```

## Advanced: Automated Deployment

### PowerShell Script for Upload

Create `deploy-update.ps1`:

```powershell
param(
    [string]$version = "1.0.0",
    [string]$serverUrl = "https://yourdomain.com/api/upload",
    [string]$apiKey = "your-api-key"
)

$distPath = ".\dist"
$files = @(
    "latest.yml",
    "BPSR Creature Tracker.exe",
    "BPSR-Tracker-Setup.exe"
)

foreach ($file in $files) {
    $filePath = Join-Path $distPath $file
    if (Test-Path $filePath) {
        Write-Host "Uploading $file..."
        
        $form = @{
            file = Get-Item -Path $filePath
            version = $version
        }
        
        $headers = @{
            "Authorization" = "Bearer $apiKey"
        }
        
        Invoke-RestMethod -Uri $serverUrl -Method Post -Form $form -Headers $headers
        Write-Host "✓ Uploaded $file"
    }
}

Write-Host "Deployment complete!"
```

Usage:
```powershell
.\deploy-update.ps1 -version "1.1.0" -apiKey "your-key"
```

### GitHub Actions Alternative

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Upload to Server
        env:
          SERVER_URL: ${{ secrets.UPDATE_SERVER_URL }}
          API_KEY: ${{ secrets.UPDATE_API_KEY }}
        run: |
          # Upload files to your server
          curl -X POST -F "file=@dist/latest.yml" \
            -H "Authorization: Bearer $API_KEY" \
            $SERVER_URL
```

## Testing

### Test Update Detection

1. **Set lower version** in `package.json`:
   ```json
   "version": "1.0.0"
   ```

2. **Build and run**:
   ```powershell
   npm run build
   # Run the built executable from dist/
   ```

3. **Upload higher version** to server (e.g., 1.1.0)

4. **App should detect** the update and show notification

### Manual Test

Open DevTools in the app and run:

```javascript
await window.electronAPI.checkForUpdates();
```

Check console for update detection logs.

## Troubleshooting

### Updates Not Detected

**Check:**
1. ✅ `latest.yml` is accessible via browser
2. ✅ Version in `latest.yml` > current app version
3. ✅ URL in `package.json` matches server location
4. ✅ Server uses HTTPS (not HTTP)
5. ✅ CORS headers are set (if needed)

**Test URL:**
```powershell
# Test if latest.yml is accessible
Invoke-WebRequest -Uri "https://yourdomain.com/updates/latest.yml"
```

### Download Fails

**Check:**
1. ✅ Executable files are accessible
2. ✅ File sizes match `latest.yml`
3. ✅ Server supports range requests
4. ✅ No authentication required for downloads

### CORS Errors

If you see CORS errors in DevTools:

**Add to server:**
```
Access-Control-Allow-Origin: *
```

## Security Considerations

### Code Signing (Recommended)

For production, sign your executables:

1. **Get code signing certificate**
2. **Configure in `package.json`**:
   ```json
   "win": {
     "certificateFile": "cert.pfx",
     "certificatePassword": "your-password",
     "signingHashAlgorithms": ["sha256"]
   }
   ```

3. **electron-updater** will verify signatures automatically

### HTTPS Only

- Never serve updates over HTTP
- Use valid SSL certificate
- Consider using Let's Encrypt for free SSL

### File Integrity

The SHA-512 hashes in `latest.yml` ensure file integrity. `electron-updater` verifies these automatically.

## Comparison: GitHub vs Self-Hosted

| Feature | GitHub Releases | Self-Hosted |
|---------|----------------|-------------|
| **Cost** | Free | Server costs |
| **Bandwidth** | Unlimited | Limited by plan |
| **Control** | Limited | Full control |
| **Setup** | Easy | More complex |
| **Reliability** | Very high | Depends on server |
| **Speed** | CDN-backed | Depends on server |
| **Analytics** | Limited | Custom tracking |
| **Privacy** | Public | Private |

## Recommended Setup

For most cases, use **both**:

```json
"publish": [
  {
    "provider": "generic",
    "url": "https://db.bptimer.com/updates"
  },
  {
    "provider": "github",
    "owner": "Visqi",
    "repo": "bpsr_bptimer_desktop"
  }
]
```

Benefits:
- Primary updates from your server
- GitHub as fallback
- Best of both worlds

## Quick Reference

### Files to Upload
- ✅ `latest.yml` (REQUIRED)
- ✅ Executable files (portable/installer)

### Server Requirements
- ✅ HTTPS enabled
- ✅ Public file access
- ✅ CORS headers (if needed)
- ✅ No caching for `latest.yml`

### URL Structure
```
https://yourdomain.com/updates/
├── latest.yml
├── BPSR Creature Tracker.exe
└── BPSR-Tracker-Setup.exe
```

## Support

For issues:
1. Check server logs
2. Test URLs in browser
3. Check DevTools console
4. Verify `latest.yml` format
