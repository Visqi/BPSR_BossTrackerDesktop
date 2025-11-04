# Blue Protocol Star Resonance - Boss Tracker

A real-time boss tracking overlay application for Blue Protocol: Star Resonance, featuring live HP updates, channel monitoring, and an always-on-top overlay for in-game use.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Electron](https://img.shields.io/badge/electron-28.0.0-47848f)
[![Build and Release](https://github.com/Visqi/BPSR_BossTrackerDesktop/actions/workflows/build-release.yml/badge.svg)](https://github.com/Visqi/BPSR_BossTrackerDesktop/actions/workflows/build-release.yml)

## 🎮 Features

- **Real-time Boss Tracking**: Live HP updates for all boss channels via Server-Sent Events (SSE)
- **Always-On-Top Overlay**: Translucent, click-through overlay perfect for in-game monitoring
- **Channel Status Monitoring**: Track up to 200 channels per boss with color-coded HP indicators
- **Boss Subscriptions**: Subscribe to specific bosses and get desktop notifications for low HP
- **Auto-Updates**: Automatic application updates with download progress tracking
- **Magical Creatures Support**: Track special magical creatures with separate UI
- **Customizable Display**: Filter bosses, search functionality, and collapsible channel details

## 📋 Requirements

- Windows 10/11 (64-bit)
- Internet connection for real-time updates
- ~100MB disk space

## 🚀 Installation

### Pre-built Releases

1. Download the latest release from the [Releases](../../releases) page
2. Choose your preferred format:
   - **Portable**: `BPSR-Creature-Tracker.exe` - No installation required, runs standalone
   - **Installer**: `BPSR-Tracker-Setup.exe` - Traditional Windows installer

**Note**: New versions are automatically built and released when updates are pushed to the main branch. The portable version includes auto-update functionality.

### From Source

```bash
# Clone the repository
git clone https://github.com/Visqi/BPSR_BossTrackerDesktop.git
cd BPSR_BossTrackerDesktop

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build portable executable
npm run build:portable

# Build installer
npm run build:installer
```

## 🎯 Usage

### Main Window

1. **Browse Bosses**: View all available bosses with their current channel status
2. **Subscribe to Bosses**: Click the bell icon to receive notifications when HP is low
3. **View Channel Details**: Click "Show Channels" to see detailed HP for all 200 channels
4. **Search**: Use the search bar to filter bosses by name
5. **Filter**: Toggle between "All Bosses", "Subscribed", and "Magical Creatures"

### Overlay Window

1. Click **"Show Overlay"** to launch the always-on-top overlay
2. The overlay displays subscribed bosses with their lowest HP channels
3. The overlay remains visible over other applications (including games)
4. Position the overlay anywhere on your screen - position is saved automatically

### Keyboard Shortcuts

- `Ctrl+R` - Refresh data
- Click overlay to interact, click outside to make it click-through

## 🏗️ Project Structure

```
BPSR_BossTrackerDesktop/
├── src/
│   ├── main.js              # Main process (Electron)
│   ├── preload.js           # Preload script (IPC bridge)
│   ├── config/
│   │   └── api-config.js    # Centralized API configuration
│   ├── services/
│   │   └── api-service.js   # API service for data fetching
│   ├── utils/
│   │   ├── auto-updater.js  # Auto-update functionality
│   │   ├── event-timers.js  # Boss timer calculations
│   │   └── magical-creatures.js # Magical creature definitions
│   └── windows/
│       ├── main/            # Main window (boss list)
│       │   ├── index.html
│       │   ├── renderer.js
│       │   └── styles.css
│       └── overlay/         # Overlay window
│           ├── index.html
│           ├── renderer.js
│           └── styles.css
├── assets/                  # Application icons
├── package.json
└── README.md
```

## 🤖 Development Notes

This project was developed with **AI assistance** using GitHub Copilot and Claude, but includes **significant manual coding and customization**. The architecture, real-time update system, overlay functionality, and API integration were designed and refined through a combination of AI-generated code and manual development.

### Technologies Used

- **Electron 28**: Desktop application framework
- **Server-Sent Events (SSE)**: Real-time data streaming from PocketBase
- **electron-updater**: Automatic application updates
- **Vanilla JavaScript**: No framework dependencies for lightweight performance
- **CSS Grid/Flexbox**: Modern responsive layouts

### Key Implementation Details

- **Dual Process Architecture**: Main process handles data/API, renderer handles UI
- **Real-time Updates**: SSE connection with automatic reconnection
- **Centralized Configuration**: Single source of truth for API events in `api-config.js`
- **Channel Status Calculation**: Smart HP-based status (alive/dead/critical) with time-based staleness
- **Overlay Window**: Always-on-top, click-through window using `screen-saver` level

## 🛠️ Building from Source

### Prerequisites

```bash
npm install
```

### Build Commands

```bash
# Development mode with hot reload
npm run dev

# Build portable executable (local build, no publishing)
npm run build:portable

# Build NSIS installer (local build, no publishing)
npm run build:installer

# Build both formats (local build, no publishing)
npm run build
```

**Note**: Local builds use `--publish never` flag. Publishing happens automatically via GitHub Actions.

### Build Output

Built files are located in `dist/`:
- `BPSR Creature Tracker.exe` - Portable executable
- `BPSR-Tracker-Setup.exe` - NSIS installer

## � Releases & Versioning

This project uses automated releases via GitHub Actions:

- **Automatic Builds**: Every push to `main` triggers a new build
- **Versioning**: Update `version` in `package.json` to create a new release
- **Auto-Updates**: Portable version automatically checks for updates on launch

For more details, see [RELEASE.md](RELEASE.md).

## �🐛 Troubleshooting

### Application Won't Start
- Ensure you have a stable internet connection
- Check if Windows Defender or antivirus is blocking the application
- Try running as administrator

### Overlay Not Showing
- Click "Show Overlay" button in the main window
- Check if overlay is hidden behind other windows
- Restart the application

### No Real-time Updates
- Check your internet connection
- The application connects to `db.bptimer.com` - ensure it's not blocked by firewall
- Check the console for connection errors (Developer Tools: `Ctrl+Shift+I`)

### Auto-Update Issues
- Ensure you have write permissions in the application directory
- For portable builds, the app must be in a writable location
- Check network connection for downloading updates

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- **BPTimer API**: Real-time boss data provided by BPTimer
- **Blue Protocol Community**: For feedback and testing
- **AI Assistance**: Developed with GitHub Copilot and Claude AI, with manual coding and refinement

---

**Disclaimer**: This is a fan-made tool and is not affiliated with or endorsed by Bandai Namco or the Blue Protocol development team.
