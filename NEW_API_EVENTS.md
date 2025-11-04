# New BPTimer API Events Support

## Update Date
November 4, 2025

## Changes Made

The BPTimer API has introduced new SSE event types that are more efficient than the previous collection-based events:

### New Event Types

1. **`mob_hp_updates`** - Replaces `mob_channel_status_sse` collection events
   - Format: `[mobId, channelNumber, hp]`
   - Example: `["hk2kzve3817ojzm", 74, 70]` (Mob ID, Channel 74, 70% HP)

2. **`mob_resets`** - Replaces `mob_reset_events` collection events
   - Format: `mobId` string or array
   - Example: `"hk2kzve3817ojzm"` or `["hk2kzve3817ojzm"]`

## Updated Files

### 1. `src/windows/main/sse-handler.js`
- Added event listener for `mob_hp_updates`
- Added event listener for `mob_resets`
- Converts new format to internal event format for compatibility

### 2. `src/services/api-service.js`
- Added event listeners in `connectRealtime()` method
- Created new `registerEventListeners()` method for event re-registration
- Updated `handleRealtimeEvent()` to handle both old and new formats
- Maintains backwards compatibility with old collection-based events

## Backwards Compatibility

The implementation maintains support for both:
- **New format**: `mob_hp_updates`, `mob_resets`
- **Old format**: `mob_channel_status_sse/*`, `mob_reset_events/*`

This ensures the app works during the API transition period.

## Event Flow

### HP Update:
1. API sends: `mob_hp_updates` → `["mobId", channelNumber, hp]`
2. Parsed and converted to: 
   ```javascript
   {
     action: 'update',
     collection: 'mob_channel_status',
     record: {
       mob: mobId,
       channel_number: channelNumber,
       last_hp: hp,
       last_update: new Date().toISOString()
     }
   }
   ```
3. Processed by `handleChannelStatusUpdate()`
4. Emitted as `channel-update` event to UI

### Boss Reset:
1. API sends: `mob_resets` → `"mobId"` or `["mobId"]`
2. Parsed and converted to:
   ```javascript
   {
     action: 'create',
     collection: 'mob_reset_events',
     record: {
       mob: mobId
     }
   }
   ```
3. Processed by `handleResetEvent()`
4. All channels reset to 100% HP
5. Emitted as `boss-reset` event to UI

## Testing

To test the new events:
1. Run the app: `npm run start`
2. Open overlay and subscribe to a boss
3. Check console for messages like:
   - `✓ Received mob_hp_updates event: [...]`
   - `✓ Received mob_resets event: ...`
   - `HP Update: Mob X, Channel Y, HP Z%`
   - `Boss Reset: Mob X`

## Notes

- The new format is more compact and efficient
- Array format `[mobId, channelNumber, hp]` reduces payload size
- All existing UI logic remains unchanged
- Event conversion happens transparently in the background
