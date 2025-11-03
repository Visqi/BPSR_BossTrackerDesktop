# Technical Documentation

## Architecture Overview

### Application Flow

```
┌─────────────────────────────────────────────────────┐
│                   Main Process                      │
│  (main.js - Electron main process)                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         API Service (api-service.js)         │  │
│  │  - Fetches boss data via HTTPS               │  │
│  │  - Connects to SSE realtime endpoint         │  │
│  │  - Maintains boss & channel status state     │  │
│  │  - Emits events on data changes              │  │
│  └──────────────────────────────────────────────┘  │
│                        │                            │
│         ┌──────────────┴──────────────┐            │
│         │                              │            │
│    ┌────▼─────┐                  ┌────▼─────┐      │
│    │  Main    │                  │ Overlay  │      │
│    │  Window  │                  │  Window  │      │
│    └──────────┘                  └──────────┘      │
└─────────────────────────────────────────────────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│  Main Renderer  │              │Overlay Renderer │
│  (renderer.js)  │              │  (renderer.js)  │
│  - Boss list    │              │  - Timer list   │
│  - Active timers│              │  - Compact view │
│  - Filters      │              │  - Draggable    │
└─────────────────┘              └─────────────────┘
```

## API Integration

### 1. Boss Data Endpoint

**URL:** `https://db.bptimer.com/api/collections/mobs/records`

**Parameters:**
- `page=1` - First page
- `perPage=500` - Get all bosses
- `skipTotal=1` - Skip total count for performance
- `filter=type = 'boss'` - Only boss mobs
- `sort=uid` - Sort by unique ID
- `expand=map` - Include map details

**Response Structure:**
```json
{
  "items": [
    {
      "id": "oej5xgi3vn0quou",
      "uid": 1,
      "name": "Golden Juggernaut",
      "respawn_time": 0,
      "type": "boss",
      "map": "gitl3cvrb3a3s0p",
      "expand": {
        "map": {
          "id": "gitl3cvrb3a3s0p",
          "name": "Asteria Plains",
          "total_channels": 200,
          "uid": 3
        }
      }
    }
  ]
}
```

### 2. Realtime SSE Endpoint

**URL:** `https://db.bptimer.com/api/realtime`

**Protocol:** Server-Sent Events (SSE)

**Subscriptions:**
- `mobs/*` - Boss data changes
- `mob_channel_status_sse/*` - Channel status updates
- `mob_reset_events/*` - Server reset events

**Event Types:**

#### PB_CONNECT
Initial connection event with client ID and subscriptions.

#### Collection Updates
Events for database changes:
```json
{
  "action": "create" | "update" | "delete",
  "collection": "mob_channel_status_sse",
  "record": {
    "mob": "boss_id",
    "channel": 42,
    "status": "killed" | "spawned",
    "next_spawn_time": "2024-01-01T12:00:00Z",
    "killed_at": "2024-01-01T11:30:00Z"
  }
}
```

## Data Processing

### Boss Data Transformation

Raw API data is transformed into a simpler structure:

```javascript
{
  id: "oej5xgi3vn0quou",           // Unique boss ID
  uid: 1,                           // Display order ID
  name: "Golden Juggernaut",        // Boss name
  respawnTime: 0,                   // Minutes (0 = event boss)
  type: "boss",                     // Always "boss"
  map: {
    id: "gitl3cvrb3a3s0p",         // Map ID
    name: "Asteria Plains",         // Map name
    totalChannels: 200,             // Number of channels
    uid: 3                          // Map order ID
  }
}
```

### Channel Status Management

Channel statuses are stored in a Map with composite keys:

**Key Format:** `${bossId}_${channelNumber}`

**Value:**
```javascript
{
  mob: "boss_id",                   // Boss ID
  channel: 42,                      // Channel number
  status: "killed",                 // Current status
  lastUpdate: "timestamp",          // Last update time
  nextSpawn: "timestamp",           // Next spawn time
  killedAt: "timestamp"             // Kill timestamp
}
```

### Timer Calculation

Active timers are calculated in real-time:

```javascript
const now = Date.now();
const spawnTime = new Date(status.nextSpawn).getTime();
const timeRemaining = spawnTime - now;

// Urgency levels
const urgency = 
  timeRemaining < 180000 ? 'critical' :  // < 3 min
  timeRemaining < 300000 ? 'urgent' :    // < 5 min
  timeRemaining < 600000 ? 'soon' :      // < 10 min
  'normal';                               // >= 10 min
```

## IPC Communication

### Main → Renderer Events

```javascript
// Boss data loaded
'boss-data' → Array of boss objects

// Boss updated (create/update/delete)
'boss-update' → { action, record }

// Channel status changed
'channel-status-update' → { action, record, allStatus }

// Reset event occurred
'reset-event' → { action, record }
```

### Renderer → Main Requests

```javascript
// Toggle overlay visibility
'toggle-overlay' → Promise<boolean>

// Get current overlay status
'get-overlay-status' → Promise<boolean>

// Refresh boss data
'refresh-data' → Promise<boolean>

// Set overlay opacity (0-1)
'set-overlay-opacity' → void

// Set overlay position
'set-overlay-position' → void
```

## Window Management

### Main Window
- **Size:** 1200x800 (min: 800x600)
- **Features:** 
  - Standard frame
  - Resizable
  - Menu bar
  - Taskbar entry
- **Purpose:** Full control panel and data visualization

### Overlay Window
- **Size:** 400x600 (fixed)
- **Features:**
  - Frameless
  - Transparent background
  - Always on top
  - No taskbar entry
  - Click-through disabled (interactive)
- **Purpose:** In-game timer display

## Security

### Context Isolation
Both windows use `contextIsolation: true` to prevent direct access to Node.js APIs from renderer processes.

### Preload Script
The `preload.js` exposes only specific, safe APIs via `contextBridge`:
- No direct file system access
- No direct process spawning
- Only whitelisted IPC channels

### Network Security
- All API calls use HTTPS
- No user authentication required
- Read-only data access
- No sensitive data transmitted

## Performance Optimizations

1. **Efficient Rendering**
   - Update timers only every 1 second
   - Use CSS transforms for animations
   - Debounce search input

2. **Memory Management**
   - Use Maps for O(1) lookups
   - Clean up event listeners on window close
   - Limit overlay to 8 visible timers

3. **Network**
   - SSE reconnection with exponential backoff
   - Single persistent connection
   - Minimal data transfer

## Error Handling

### API Service
- Automatic reconnection on SSE failure
- 5-second delay before retry
- Graceful degradation if API unavailable

### Renderer
- Empty states for no data
- Loading states during fetch
- Connection status indicators

## Build Configuration

### Electron Builder
The app uses electron-builder for packaging:

**Target Platforms:**
- Windows (NSIS installer)
- Can be extended for macOS and Linux

**Included Files:**
- All `src/**/*` files
- All `assets/**/*` files
- `package.json`

**Excluded:**
- `node_modules` (bundled separately)
- Development files
- Documentation

## Future Enhancement Ideas

1. **Notification System**
   - Desktop notifications for upcoming spawns
   - Sound alerts for critical timers

2. **User Preferences**
   - Save overlay position
   - Customize colors
   - Filter preferences

3. **Additional Data**
   - Boss loot information
   - Drop rates
   - Farming routes

4. **Multi-language Support**
   - i18n implementation
   - Language selection

5. **Statistics**
   - Track personal boss kills
   - Farming efficiency metrics
   - Channel popularity heatmap

## Dependencies

### Production
- `electron`: Desktop app framework
- `eventsource`: SSE client for Node.js

### Development
- `electron-builder`: Build and packaging tool

## License & Attribution

This project uses data from bptimer.com and is built for the Blue Protocol community. It's a read-only, non-invasive tool that doesn't modify game files or inject code.
