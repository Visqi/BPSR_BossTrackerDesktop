# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2025-11-04

### Fixed
- Portable executable filename (removed spaces for better compatibility)
- GitHub Actions workflow now correctly uploads portable version to releases

### Changed
- Portable artifact name changed from `BPSR Creature Tracker.exe` to `BPSR-Tracker-Portable.exe`

## [1.0.0] - 2025-11-04

### Initial Release

#### Features
- Real-time boss HP tracking across 200 channels per boss
- Always-on-top overlay window for in-game monitoring
- Boss subscription system with desktop notifications
- Live Server-Sent Events (SSE) connection for instant updates
- Color-coded channel status (healthy, low, critical, dead)
- Magical creatures support with dedicated UI
- Search and filter functionality
- Auto-update system for seamless application updates
- Customizable overlay positioning with saved preferences

#### Technical
- Electron 28 desktop application framework
- Centralized API configuration system
- Dual-process architecture (main + renderer)
- PocketBase API integration
- Support for both portable and installer builds
- Click-through overlay with screen-saver level always-on-top

#### Documentation
- Comprehensive README with installation and usage guides
- Contributing guidelines for open-source collaboration
- MIT License
- Project structure documentation
