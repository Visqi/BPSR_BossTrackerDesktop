# Debugging mob_hp_updates Events

## How to Debug the Event Structure

### Step 1: Open DevTools
1. Run the app: `npm run dev`
2. Press `F12` or `Ctrl+Shift+I` to open DevTools
3. Go to the **Console** tab

### Step 2: Watch for Events

Look for these log messages:

```
🔄 mob_hp_updates event: [data]
🔍 DEBUG mob_hp_updates raw data: ...
```

### Expected Formats

#### Format 1: [mobId, channelNumber, hp]
```javascript
["hk2kzve3817ojzm", 74, 70]
// mobId: "hk2kzve3817ojzm"
// channelNumber: 74
// hp: 70
```

#### Format 2: [channelNumber, hp] (your suspicion)
```javascript
[74, 70]
// channelNumber: 74
// hp: 70
// (mobId unknown - need to infer from context)
```

#### Format 3: [channelStatusId, hp]
```javascript
["some_id_here", 70]
// channelStatusId: combination of mob+channel
// hp: 70
```

### Step 3: Copy the Exact Data

When you see a `mob_hp_updates` event, copy the EXACT data that appears and send it to me.

Example:
```
🔄 mob_hp_updates event: [74, 70]
🔍 DEBUG mob_hp_updates raw data: [74, 70] Type: object IsArray: true
```

### Step 4: Check Boss Data

Also check what boss/mob IDs you have loaded:

```javascript
// In DevTools Console, run:
await window.electronAPI.getBosses()
```

This will show you the mob IDs in your system.

### Step 5: Test Manual Update

To test if the UI updates work at all, try this in DevTools Console:

```javascript
// Manually trigger a channel update
window.electronAPI.updateChannelHP('hk2kzve3817ojzm', 1, 50, new Date().toISOString())
```

Change:
- First parameter: actual mob ID from your boss list
- Second parameter: channel number (1-50)
- Third parameter: HP percentage (0-100)

If this works, the UI update logic is fine, and we just need to fix the event parsing.

## Common Issues

### Issue 1: Wrong Array Length
If the array has 2 elements instead of 3, it means the mob ID is missing.

**Solution:** We need to determine the mob ID from context (subscription, channel ID pattern, etc.)

### Issue 2: Channel Status ID Instead of Mob ID
If the first element is a long ID like `"mob123_ch45"`, it's a combined ID.

**Solution:** Parse it to extract mob and channel:
```javascript
const [statusId, hp] = data;
const [mobId, channelStr] = statusId.split('_');
const channelNumber = parseInt(channelStr.replace('ch', ''));
```

### Issue 3: Different Event Name
If you don't see `mob_hp_updates` events at all, check for other event names:

```javascript
// Check all SSE events
eventSource.onmessage = (event) => {
  console.log('📨 ANY EVENT:', event.type, event.data);
};
```

## Quick Fix Options

### Option A: If format is [channelNumber, hp]

The mob ID might come from the subscription context. Update the parser:

```javascript
[SSE_EVENT_TYPES.MOB_HP_UPDATES]: {
  parse: (data, context) => {
    if (Array.isArray(data) && data.length === 2) {
      const [channelNumber, hp] = data;
      // We'd need to know which mob this is for
      // Maybe from the subscription or event context
      return {
        action: 'update',
        collection: COLLECTIONS.MOB_CHANNEL_STATUS,
        record: {
          mob: context?.mobId || 'unknown',  // Need to get from context
          channel_number: channelNumber,
          last_hp: hp,
          last_update: new Date().toISOString()
        }
      };
    }
  }
}
```

### Option B: If format is [channelStatusId, hp]

Parse the combined ID:

```javascript
[SSE_EVENT_TYPES.MOB_HP_UPDATES]: {
  parse: (data) => {
    if (Array.isArray(data) && data.length === 2) {
      const [statusId, hp] = data;
      
      // Parse ID like "mob123_45" or "mob123_ch45"
      const parts = statusId.split('_');
      const mobId = parts[0];
      const channelNumber = parseInt(parts[1].replace('ch', ''));
      
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
  }
}
```

## What to Send Me

Please provide:

1. **Exact console output** when an HP update event arrives
2. **Boss/Mob data** from `await window.electronAPI.getBosses()`
3. **Does manual update work?** Result of testing the `updateChannelHP` command
4. **Screenshot** of the console logs if possible

With this information, I can create the exact parser needed! 🔍
