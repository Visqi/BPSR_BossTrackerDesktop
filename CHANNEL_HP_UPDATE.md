# MAJOR UPDATE: Channel HP Tracking System

## What Changed

The app was completely rebuilt to track **boss HP status per channel** (like the original bptimer.com), not respawn timers.

## Key Changes

### 1. API Service (`src/services/api-service.js`)
**Before:** Tracked timers and spawn times
**After:** Tracks real-time HP status for each channel (1-50) per boss

- Connects to `mob_channel_status_sse` collection via SSE
- Loads all channel status data on startup
- Real-time updates via Server-Sent Events (SSE)
- Tracks HP percentage (0-100) for each channel
- Determines channel status: `alive` (HP > 0), `dead` (HP = 0), `unknown` (no data)

### 2. Main Window (`src/windows/main/renderer.js`)
**Before:** Showed boss cards with timer countdowns
**After:** Shows boss cards with channel HP status pills

Each boss card now displays:
- **Channel Stats**: Alive/Dead/Total channel counts
- **Channel Pills**: Color-coded HP status pills
  - Green (Healthy): HP ≥ 60%
  - Yellow (Low): HP 30-59%
  - Orange (Critical): HP < 30% (pulsing animation)
  - Gray (Dead): HP = 0%
- **Expandable View**: Click "Show All Channels" to see all 1-50 channels in a grid
- **Subscription**: Star button to subscribe for low HP notifications

### 3. Data Flow
```
API Service (Main Process)
    ↓
  SSE Connection to db.bptimer.com/api/realtime
    ↓
Events: mob_channel_status_sse (HP updates)
    ↓
Main Process forwards to Renderer
    ↓
UI updates channel pills in real-time
```

### 4. Real-time Updates
- **Auto-refresh**: No manual refresh needed! SSE pushes updates automatically
- **Connection status**: Shows "Connected", "Connecting", or "Error"
- **Last update time**: Displays when data was last updated
- **Live channel updates**: Pills update instantly when HP changes

### 5. Channel Status Colors
- **Healthy (Green)**: HP 60-100%
- **Low (Yellow)**: HP 30-59%
- **Critical (Orange)**: HP 1-29% - Pulsing animation warns of low HP
- **Dead (Gray)**: HP = 0% - Boss killed on this channel
- **Unknown (Dark Gray)**: No data available yet

### 6. Subscriptions & Notifications
**Changed:** Notifications now based on HP thresholds, not spawn times

- Subscribe to a boss by clicking the star (☆) button
- Notifications trigger when subscribed bosses have channels below 30% HP
- Desktop notifications + in-app toast messages
- Check interval: Every 30 seconds

## API Endpoints Used

1. **Boss Data**: `GET /collections/mobs/records`
   - Returns all bosses with map info and total channels

2. **Channel Status**: `GET /collections/mob_channel_status_sse/records`
   - Returns HP status for all channels of all bosses

3. **Realtime SSE**: `GET /realtime`
   - Subscribes to real-time updates:
     - `mob_channel_status_sse` - HP changes
     - `mobs` - Boss updates
     - `mob_reset_events` - Boss respawns (all channels → 100%)

## How It Works

1. **On Startup**:
   - Load all 14 bosses from API
   - Load HP status for all ~700 channels (14 bosses × 50 channels)
   - Connect to SSE for real-time updates
   - Display all bosses with current channel HP

2. **Real-time Updates**:
   - When player reports HP on bptimer.com → HP report created
   - Server updates `mob_channel_status_sse` table
   - SSE pushes update to all connected clients
   - App receives update and refreshes that specific channel pill
   - No manual refresh needed!

3. **Channel Display**:
   - Main view: Shows top 15 alive channels sorted by HP (lowest first)
   - Expanded view: Shows all 50 channels in a grid
   - Each pill displays channel number and color-coded HP status
   - Hover to see exact HP percentage

## Files Modified

1. `src/services/api-service.js` - Complete rewrite for HP tracking
2. `src/windows/main/renderer.js` - Replaced with HP pill rendering
3. `src/windows/main/styles.css` - Added channel pill styles
4. `src/preload.js` - Updated IPC methods for new data API
5. `src/main.js` - Updated event forwarding and IPC handlers

## Testing

1. Start the app: `npm start`
2. You should see:
   - Connection status: "Connected" (green)
   - Boss cards with channel statistics
   - Color-coded channel pills showing HP
   - No "Loading" state stuck

3. Check realtime updates:
   - Visit https://bptimer.com
   - Submit an HP report for any boss
   - Your app should update within seconds!

## Troubleshooting

### "Connecting..." stuck
- Check internet connection
- Verify https://db.bptimer.com/api/realtime is accessible
- Check console for SSE errors

### No channel pills showing
- Data may still be loading
- Check if boss.totalChannels is set correctly
- Verify channel data loaded with: `Loaded X channel statuses` in console

### Channels not updating
- SSE connection may have dropped
- Check connection status indicator
- Try clicking Refresh button

## Next Steps (Optional)

1. **Overlay Update**: Update overlay to show only subscribed bosses with alive channels
2. **Filtering**: Add filters for HP ranges (show only critical, show only alive, etc.)
3. **Sorting**: Sort bosses by most alive channels or lowest HP
4. **Channel Click**: Click channel pill to see detailed HP history
5. **Persist Subscriptions**: Save subscribed bosses to file

## Architecture Notes

Based on https://github.com/woheedev/bptimer:
- Uses PocketBase as backend (same as original)
- SSE for realtime (no polling!)
- Channel status tracked in `mob_channel_status_sse` table
- HP reports create/update channel status records
- Server-side cron resets channels to 100% at respawn time

## Credits

Original project: https://github.com/woheedev/bptimer by @woheedev
