# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.6] - 2025-11-10

### Added
- **Location Tooltips for Magical Creatures**: Channel pills now show location names on hover
  - Golden Nappo: BEECH, CR, MUKU, FARM, BL, RUINS (6 locations)
  - Silver Nappo: BEECH, LONE, CR, SCOUT 1-2, MUKU 1-2, FARM, BL, RUINS 1-2 (11 locations)
  - Loyal Boarlet: CR, SCOUT 1-3, MUKU, FARM, REST 1-2 (8 locations)
  - Tooltip format: "Channel X • HP% • SHORT_NAME" (e.g., "Channel 42 • 75% HP • BEECH")
  - Only shown when location_id is provided by API
- **Map Modal Popup**: Added 🗺️ map button to magical creature cards
  - In-app modal popup (no external browser needed)
  - High-quality spawn map images from bptimer.com
  - Close via X button, ESC key, or click outside modal
  - Smooth fade-in/slide-in animations with blur backdrop
- **Location Data Pipeline**: Full support for location-based spawns
  - API now loads and stores `location_id` from mob_channel_status
  - Real-time SSE updates include location information
  - Location data preserved through all update channels

### Changed
- Map button now opens in-app modal instead of external browser
- Location names shown only in tooltips (removed visible labels for cleaner UI)
- Channel tooltips simplified to show short location names without "Location:" prefix
- Map image URLs corrected for all magical creatures

### Fixed
- Map button assignments corrected (Golden Nappo, Silver Nappo, Loyal Boarlet now show correct maps)
- Breezy Boarlet and Lovely Boarlet map buttons added
- Location data now properly flows from API → Main Process → Renderer

### Technical
- Added `MOB_LOCATIONS` configuration with location names and map URLs for 5 creatures
- Added `MOB_ID_TO_MONSTER_ID` mapping from database IDs to monster IDs
- Created helper functions: `getLocationName(mobId, locationId)` and `getMapUrl(mobId)`
- Updated IPC handlers to accept `locationId` parameter
- Enhanced API service to extract and store `location_id` from channel records
- Modal HTML, CSS, and JavaScript for image popup viewer (z-index: 10000)
- Location data pipeline: API → apiService.channelStatusMap → IPC → Renderer tooltips

## [1.0.5] - 2025-11-10

### Changed
- Updated SSE event handler to support multi-dimensional HP updates
- `mob_hp_updates` now processes batch updates in a single event
- Improved real-time update performance by handling multiple channel updates simultaneously

### Added
- Support for optional `location_image` field in HP updates
- Location image data is now stored and tracked for magical creatures
- Enhanced logging to show location information when present

### Fixed
- Fixed parsing of new multi-dimensional `mob_hp_updates` format: `[["mobId",channel,hp,author,locationImage],...]`
- Backwards compatibility maintained for legacy single-update format
- Location image properly extracted from 4th element in update array

## [1.0.4] - 2025-11-07

### Changed
- Updated API routes to match new backend structure
- Boss data endpoint now includes type filter and map expansion
- Magical creature data is now loaded separately with dedicated API route
- Channel status loading now uses mob ID filters with pagination
  - Bosses: 5 pages with boss-specific filter
  - Magical Creatures: 3 pages with creature-specific filter
- Improved channel status loading efficiency with targeted mob filters

### Fixed
- API routes updated to work with new PocketBase backend structure
- Magical creatures now properly loaded alongside bosses
- Fixed 403 Forbidden errors by adding required browser headers (User-Agent, Origin, Referer)
- API requests now include proper URL encoding for filters
- Added HTTP status code validation for better error handling

## [1.0.3] - 2025-11-05

### Fixed
- Typo in footer

## [1.0.2] - 2025-11-04

### Changed
- Updates on Auto Update and Setup

### Fixed
- Portable Version Auto Update now gives an Info to the Github instead of an error

## [1.0.1] - 2025-11-04

### Fixed
- Portable executable filename (removed spaces for better compatibility)
- GitHub Actions workflow now correctly uploads portable version to releases
- Auto-updater error when running portable build (ENOENT: app-update.yml)

### Changed
- Portable artifact name changed from `BPSR Creature Tracker.exe` to `BPSR-Tracker-Portable.exe`
- Auto-updates are now only enabled for installer builds
- Portable builds show a friendly message when checking for updates, directing users to GitHub releases

### Added
- Automatic detection of portable vs installer builds
- User-friendly messaging for portable build limitations

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
