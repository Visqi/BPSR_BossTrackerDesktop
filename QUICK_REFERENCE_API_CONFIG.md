# Quick Reference: Centralized API Configuration

## 🎯 The Problem We Solved

**Before:** Adding a new SSE event type required updating code in **3 places**
**Now:** Add it in **1 place** - done!

---

## 📁 File Structure

```
src/
├── config/
│   └── api-config.js          ⭐ SINGLE SOURCE OF TRUTH
│
├── services/
│   └── api-service.js         ✅ Uses api-config.js
│
└── windows/main/
    ├── sse-handler.js         ✅ Uses api-config.js
    └── renderer.js
```

---

## 🚀 How to Add a New Event

### Open: `src/config/api-config.js`

```javascript
// 1. Add event type name
const SSE_EVENT_TYPES = {
  MOB_HP_UPDATES: 'mob_hp_updates',
  MOB_RESETS: 'mob_resets',
  YOUR_NEW_EVENT: 'your_event_name'  // ← Add here
};

// 2. Subscribe to it
const SSE_SUBSCRIPTIONS = [
  SSE_EVENT_TYPES.MOB_HP_UPDATES,
  SSE_EVENT_TYPES.MOB_RESETS,
  SSE_EVENT_TYPES.YOUR_NEW_EVENT  // ← Add here
];

// 3. Define how to parse it
const EVENT_HANDLERS = {
  [SSE_EVENT_TYPES.YOUR_NEW_EVENT]: {  // ← Add here
    parse: (data) => {
      // Transform the data into standard format
      return {
        action: 'update',  // or 'create', 'delete'
        collection: COLLECTIONS.YOUR_COLLECTION,
        record: {
          // Your data structure
        }
      };
    },
    description: 'What this event does'
  }
};
```

### That's It! ✅

Both processes will automatically:
- ✅ Subscribe to the new event
- ✅ Listen for the new event
- ✅ Parse it correctly
- ✅ Handle it properly

---

## 📊 What's Configured

| Configuration | Description | Location |
|---------------|-------------|----------|
| **API_BASE_URL** | Base URL for API calls | `api-config.js` |
| **SSE_EVENT_TYPES** | All SSE event type names | `api-config.js` |
| **SSE_SUBSCRIPTIONS** | Events to subscribe to | `api-config.js` |
| **COLLECTIONS** | Collection names | `api-config.js` |
| **EVENT_HANDLERS** | How to parse each event | `api-config.js` |

---

## 🔧 Current Event Types

```javascript
SSE_EVENT_TYPES = {
  // New format (current)
  MOB_HP_UPDATES: 'mob_hp_updates',      // HP updates
  MOB_RESETS: 'mob_resets',              // Boss resets
  
  // Old format (backwards compatibility)
  MOB_CHANNEL_STATUS_SSE: 'mob_channel_status_sse',
  MOB_RESET_EVENTS: 'mob_reset_events',
  MOBS: 'mobs'
}
```

---

## 📝 Event Handler Format

```javascript
[EVENT_TYPE]: {
  parse: (data) => {
    // Return standardized format:
    return {
      action: 'update' | 'create' | 'delete',
      collection: 'collection_name',
      record: { /* your data */ }
    };
  },
  description: 'Human-readable description'
}
```

---

## 🧪 Testing

```bash
# Start the app
npm run start

# Check console for:
✓ Registering event listeners for: [event1, event2, ...]
✓ Subscription confirmed
✓ Now listening for realtime events: [event1, event2, ...]
```

---

## ⚡ Benefits

| Before | After |
|--------|-------|
| ❌ Update 3 files | ✅ Update 1 file |
| ❌ Duplicate code | ✅ Single source |
| ❌ Risk of mismatch | ✅ Always in sync |
| ❌ 30+ min to add event | ✅ 5 min to add event |
| ❌ Hard to maintain | ✅ Easy to maintain |

---

## 📚 Documentation

- **Full Guide:** `CENTRALIZED_API_CONFIG.md`
- **Summary:** `API_REFACTORING_SUMMARY.md`
- **This File:** Quick reference

---

## 🆘 Troubleshooting

**Event not received?**
1. Check if it's in `SSE_SUBSCRIPTIONS`
2. Check if it has an entry in `EVENT_HANDLERS`
3. Check console for error messages

**Event not parsed?**
1. Check the parse function matches data format
2. Add `console.log('Raw data:', data)` in parse
3. Verify return format is correct

---

## 💡 Example: Real Event

### mob_hp_updates

```javascript
// Event from server: ["mob_id", 42, 85]
// Meaning: Mob ID, Channel 42, 85% HP

// Handler in api-config.js:
[SSE_EVENT_TYPES.MOB_HP_UPDATES]: {
  parse: (data) => {
    if (Array.isArray(data) && data.length === 3) {
      const [mobId, channelNumber, hp] = data;
      return {
        action: 'update',
        collection: COLLECTIONS.MOB_CHANNEL_STATUS,
        record: {
          mob: mobId,
          channel_number: channelNumber,
          last_hp: hp,
          last_update: new Date().toISOString()
        }
      };
    }
    return null;
  },
  description: 'HP update for a specific mob channel'
}
```

---

## 🎉 Success!

You now have a **centralized, maintainable, and scalable** API configuration system!

**Happy coding! 🚀**
