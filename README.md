# Blue Protocol Star Resonance - Boss Timer & Overlay

A desktop application built with Electron for tracking Blue Protocol boss spawns and displaying real-time timers with an in-game overlay.

## Features

- ⏰ **Real-time Boss Timers** - Track active boss respawn timers across all channels
- 📊 **Complete Boss Database** - View all bosses with their maps and respawn times
- 🎮 **In-Game Overlay** - Transparent, draggable overlay to show timers while playing
- 🔄 **Live Updates** - Real-time synchronization with bptimer.com via Server-Sent Events
- 🗺️ **Map Filtering** - Filter bosses by map location
- 🔍 **Boss Search** - Quickly find specific bosses
- 🎨 **Beautiful UI** - Modern, responsive interface with smooth animations

## Screenshots

### Main Window
The main window displays all bosses and active timers with filtering options.

### Overlay Window
A transparent, draggable overlay that sits on top of your game showing the most urgent timers.

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development Mode**
   ```bash
   npm start
   ```
   
   Or with DevTools enabled:
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
   
   This will create an installer in the `dist` folder.

## Usage

### Main Window Controls

- **Show/Hide Overlay** - Toggle the in-game overlay on/off
- **Refresh** - Manually refresh boss data from the API
- **Map Filter** - Filter bosses by their map location
- **Search** - Type to search for specific bosses

### Overlay Controls

- **Drag** - Click and drag the header to reposition the overlay
- **Opacity Slider** - Adjust the overlay transparency (30-100%)
- **Close Button** - Click the X to close the overlay

### Timer States

Timers are color-coded by urgency:
- 🔴 **Critical** (< 3 min) - Red with pulsing animation
- 🟡 **Urgent** (3-5 min) - Orange/yellow highlight
- 🟢 **Soon** (5-10 min) - Yellow border
- ⚪ **Normal** (> 10 min) - Default purple/blue

## API Endpoints Used

The app connects to the following bptimer.com API endpoints:

1. **Boss Data**
   ```
   GET https://db.bptimer.com/api/collections/mobs/records
   ```
   Fetches all boss information including names, maps, and respawn times.

2. **Real-time Updates**
   ```
   SSE https://db.bptimer.com/api/realtime
   ```
   Server-Sent Events stream for live updates on:
   - Boss kills and respawns
   - Channel status changes
   - Reset events

## Project Structure

```
blue-protocol-star-resonance/
├── src/
│   ├── main.js                 # Electron main process
│   ├── preload.js              # Preload script for IPC
│   ├── services/
│   │   └── api-service.js      # API service layer
│   └── windows/
│       ├── main/               # Main window
│       │   ├── index.html
│       │   ├── renderer.js
│       │   └── styles.css
│       └── overlay/            # Overlay window
│           ├── index.html
│           ├── renderer.js
│           └── styles.css
├── assets/                     # Icons and images
├── package.json
└── README.md
```

## Technologies Used

- **Electron** - Desktop application framework
- **Node.js** - JavaScript runtime
- **EventSource** - Server-Sent Events client
- **HTML/CSS/JavaScript** - Frontend technologies

## Data Source

All data is sourced from [bptimer.com](https://bptimer.com/), a community-driven Blue Protocol boss timer website.

## Features Breakdown

### Main Window
- Displays all bosses with their information
- Shows active timers in a grid layout
- Filters by map and search
- Connection status indicator
- Refresh button for manual updates

### Overlay Window
- Transparent background with blur effect
- Always on top of other windows
- Draggable positioning
- Adjustable opacity
- Shows up to 8 most urgent timers
- Auto-updates every second
- Color-coded urgency levels

### API Service
- Fetches boss data on startup
- Establishes SSE connection for real-time updates
- Handles reconnection on connection loss
- Parses and emits events for:
  - Boss updates (create, update, delete)
  - Channel status changes
  - Reset events
- Maintains state for bosses and channel statuses

## Troubleshooting

### Overlay not showing
- Make sure you clicked "Show Overlay" in the main window
- The overlay might be off-screen, close and reopen it

### Connection issues
- Check your internet connection
- The API might be temporarily down
- Click Refresh to retry the connection

### Boss data not loading
- Click the Refresh button
- Check if bptimer.com is accessible
- Restart the application

## Development

### Running in Dev Mode
```bash
npm run dev
```
This opens DevTools for both windows automatically.

### Project Commands
- `npm start` - Run the app
- `npm run dev` - Run with DevTools
- `npm run build` - Build for production

## License

MIT License

## Credits

- Data provided by [bptimer.com](https://bptimer.com/)
- Built for the Blue Protocol community

## Disclaimer

This is an independent fan-made tool and is not affiliated with or endorsed by Bandai Namco or the Blue Protocol development team. This tool does not inject code into the game or modify game files in any way.
