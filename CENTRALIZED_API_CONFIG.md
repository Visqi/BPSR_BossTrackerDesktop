# Centralized API Configuration Guide

## Overview

To eliminate code duplication and make maintenance easier, all API-related configurations (subscriptions, event types, and handlers) are now centralized in a single configuration file.

## Problem Solved

**Before:** When adding a new event type, you had to update code in 3 places:
- ❌ `src/services/api-service.js` (main process)
- ❌ `src/windows/main/sse-handler.js` (renderer process)
- ❌ Event handler logic duplicated in both

**Now:** Add new events in just 1 place:
- ✅ `src/config/api-config.js` (single source of truth)

## Configuration File

### Location
```
src/config/api-config.js
```

### Structure

The configuration file exports:

1. **API_BASE_URL** - Base URL for all API calls
2. **SSE_EVENT_TYPES** - All SSE event type names
3. **SSE_SUBSCRIPTIONS** - List of events to subscribe to
4. **COLLECTIONS** - Collection names for data handling
5. **EVENT_HANDLERS** - How to parse and handle each event type

## How to Add a New Event Type

### Step 1: Add to SSE_EVENT_TYPES

```javascript
const SSE_EVENT_TYPES = {
  MOB_HP_UPDATES: 'mob_hp_updates',
  MOB_RESETS: 'mob_resets',
  
  // Add your new event here:
  NEW_EVENT: 'new_event_name'
};
```

### Step 2: Add to SSE_SUBSCRIPTIONS

```javascript
const SSE_SUBSCRIPTIONS = [
  SSE_EVENT_TYPES.MOB_HP_UPDATES,
  SSE_EVENT_TYPES.MOB_RESETS,
  
  // Add your new event to subscriptions:
  SSE_EVENT_TYPES.NEW_EVENT
];
```

### Step 3: Add Event Handler

```javascript
const EVENT_HANDLERS = {
  // ... existing handlers ...
  
  [SSE_EVENT_TYPES.NEW_EVENT]: {
    // Define how to parse the event data
    parse: (data) => {
      // Transform the raw event data into standard format
      return {
        action: 'update',  // or 'create', 'delete'
        collection: COLLECTIONS.YOUR_COLLECTION,
        record: {
          // Extract and format the data
          id: data.id,
          value: data.value
        }
      };
    },
    description: 'Description of what this event does'
  }
};
```

### Step 4: Done! ✅

That's it! Both the main process and renderer process will automatically:
- Subscribe to the new event
- Register listeners for it
- Parse data using your handler
- Process the event correctly

## Example: Adding a New Event

Let's say the API introduces a new event type `player_location_updates`:

```javascript
// In src/config/api-config.js

// 1. Add to event types
const SSE_EVENT_TYPES = {
  MOB_HP_UPDATES: 'mob_hp_updates',
  MOB_RESETS: 'mob_resets',
  PLAYER_LOCATION: 'player_location_updates'  // NEW
};

// 2. Add to subscriptions
const SSE_SUBSCRIPTIONS = [
  SSE_EVENT_TYPES.MOB_HP_UPDATES,
  SSE_EVENT_TYPES.MOB_RESETS,
  SSE_EVENT_TYPES.PLAYER_LOCATION  // NEW
];

// 3. Add collection if needed
const COLLECTIONS = {
  MOBS: 'mobs',
  MOB_CHANNEL_STATUS: 'mob_channel_status',
  PLAYER_LOCATIONS: 'player_locations'  // NEW
};

// 4. Add handler
const EVENT_HANDLERS = {
  // ... existing handlers ...
  
  [SSE_EVENT_TYPES.PLAYER_LOCATION]: {
    parse: (data) => {
      // Data format: [playerId, x, y, z]
      if (Array.isArray(data) && data.length === 4) {
        const [playerId, x, y, z] = data;
        return {
          action: 'update',
          collection: COLLECTIONS.PLAYER_LOCATIONS,
          record: {
            player_id: playerId,
            x: x,
            y: y,
            z: z,
            timestamp: new Date().toISOString()
          }
        };
      }
      return null;
    },
    description: 'Player location update in game world'
  }
};
```

**That's it!** No need to touch `api-service.js` or `sse-handler.js`.

## How It Works

### Main Process (api-service.js)

```javascript
// Imports the config
const { SSE_SUBSCRIPTIONS, EVENT_HANDLERS } = require('../config/api-config');

// Automatically subscribes
subscribeToCollections(clientId) {
  // Uses SSE_SUBSCRIPTIONS automatically
}

// Automatically registers listeners
registerEventListeners() {
  // Loops through EVENT_HANDLERS and registers each one
  Object.entries(EVENT_HANDLERS).forEach(([eventType, handler]) => {
    this.eventSource.addEventListener(eventType, (event) => {
      const parsedData = handler.parse(data);
      this.handleRealtimeEvent(parsedData);
    });
  });
}
```

### Renderer Process (sse-handler.js)

```javascript
// Imports the config
import { SSE_SUBSCRIPTIONS, EVENT_HANDLERS } from '../../config/api-config.js';

// Automatically subscribes
function subscribeToCollections(clientId) {
  // Uses SSE_SUBSCRIPTIONS automatically
}

// Automatically registers listeners
Object.entries(EVENT_HANDLERS).forEach(([eventType, handler]) => {
  eventSource.addEventListener(eventType, (event) => {
    const parsedData = handler.parse(data);
    window.dispatchEvent(new CustomEvent('realtime-update', { 
      detail: parsedData 
    }));
  });
});
```

## Benefits

### ✅ Single Source of Truth
- All event configuration in one place
- No duplication between main and renderer processes

### ✅ Easy Maintenance
- Add new events by editing one file
- Remove old events by editing one file
- Update event parsing logic in one place

### ✅ Consistency
- Same event handling logic everywhere
- No risk of processes getting out of sync

### ✅ Type Safety (Future)
- Easy to add TypeScript types later
- All event types defined in one place

### ✅ Documentation
- Each event handler includes a description
- Easy to see what events are supported

## Testing New Events

1. **Add the event** to `api-config.js`
2. **Restart the app**: `npm run start`
3. **Check console logs**:
   ```
   Registering event listeners for: [..., 'new_event_name']
   ✓ Subscription confirmed
   ✓ Now listening for realtime events: [..., 'new_event_name']
   ```
4. **Trigger the event** from your API
5. **Verify in console**:
   ```
   🔄 new_event_name event: [data]
   ✓ Parsed new_event_name: {action, collection, record}
   📦 Handling event: collection=..., action=...
   ```

## Migration Checklist

If you have old code with hardcoded event types:

- [ ] Remove hardcoded event type strings
- [ ] Import event types from config
- [ ] Remove duplicate event handler code
- [ ] Use centralized EVENT_HANDLERS
- [ ] Test all events still work

## Common Patterns

### Simple Event (Single Value)

```javascript
[SSE_EVENT_TYPES.SIMPLE]: {
  parse: (data) => ({
    action: 'update',
    collection: COLLECTIONS.SOMETHING,
    record: data  // Use data as-is
  }),
  description: 'Simple event'
}
```

### Array Format Event

```javascript
[SSE_EVENT_TYPES.ARRAY_FORMAT]: {
  parse: (data) => {
    if (Array.isArray(data)) {
      const [id, value1, value2] = data;
      return {
        action: 'update',
        collection: COLLECTIONS.SOMETHING,
        record: { id, value1, value2 }
      };
    }
    return null;
  },
  description: 'Array format event'
}
```

### Object Format Event

```javascript
[SSE_EVENT_TYPES.OBJECT_FORMAT]: {
  parse: (data) => {
    // Already in correct format
    data.collection = COLLECTIONS.SOMETHING;
    return data;
  },
  description: 'Object format event'
}
```

### Conditional Handling

```javascript
[SSE_EVENT_TYPES.CONDITIONAL]: {
  parse: (data) => {
    if (data.type === 'A') {
      return { /* format A */ };
    } else if (data.type === 'B') {
      return { /* format B */ };
    }
    return null;  // Ignore unknown types
  },
  description: 'Event with conditional parsing'
}
```

## Advanced: Adding Custom Logic

If you need custom handling beyond parsing:

### In Main Process (api-service.js)

After `handleRealtimeEvent`, add specific handlers:

```javascript
handleCustomEvent(action, record) {
  // Your custom logic here
  this.emit('custom-event', record);
}
```

Then update `handleRealtimeEvent`:

```javascript
else if (collection === COLLECTIONS.CUSTOM) {
  this.handleCustomEvent(action, record);
}
```

### In Renderer (renderer.js)

Listen for the custom event:

```javascript
window.addEventListener('realtime-update', (event) => {
  if (event.detail.collection === 'custom_collection') {
    // Handle custom event
  }
});
```

## Troubleshooting

### Event Not Received

1. **Check subscription**: Is the event in `SSE_SUBSCRIPTIONS`?
2. **Check handler**: Is there an entry in `EVENT_HANDLERS`?
3. **Check console**: Any error messages about the event?
4. **Check network**: Is the event being sent from server?

### Event Not Parsed Correctly

1. **Check parse function**: Does it match the data format?
2. **Add logging**: `console.log('Raw data:', data)` in parse function
3. **Check return value**: Is the parse function returning the correct format?

### Subscription Not Working

1. **Check API_BASE_URL**: Is it correct?
2. **Check network tab**: Is the subscription POST succeeding?
3. **Check server logs**: Is the server accepting the subscription?

## Future Enhancements

Potential improvements:

- [ ] Add TypeScript types for all events
- [ ] Add event validation schemas
- [ ] Add event rate limiting configuration
- [ ] Add event retry logic configuration
- [ ] Add event priority levels
- [ ] Add event filtering by user preferences

## Summary

**Old Way (3 places to update):**
```
api-service.js    → Add listener
sse-handler.js    → Add listener  
Both files        → Add parsing logic
```

**New Way (1 place to update):**
```
api-config.js     → Add event type, subscription, and handler
```

That's it! Everything else happens automatically. 🎉
