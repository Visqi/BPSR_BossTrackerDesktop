# Changelog - BPSR Monster Tracker Updates

## 🎯 Summary of Changes

Fixed critical issues with the overlay, subscription filter, and added boss images support.

---

## ✅ Completed Features

### 1. **Fixed Overlay Display** 
**Issue**: Overlay showed nothing - was using old timer-based system  
**Fix**: Completely rewrote overlay to show alive channels grouped by boss

**Changes**:
- `src/windows/overlay/renderer.js` - Rewrote entire file
  - Removed timer-based logic (nextSpawn, channelStatusMap)
  - Added `updateDisplay()` function to fetch alive channels
  - Groups alive channels by subscribed bosses
  - Shows max 10 channels per boss, sorted by HP (low to high)
  - Auto-refreshes every 5 seconds

- `src/windows/overlay/styles.css` - Added new styles
  - `.boss-group` - Container for each boss section
  - `.boss-header` - Boss name + alive count
  - `.channel-grid` - Responsive grid layout
  - `.channel-pill` - HP-based color coding:
    - Green (≥60% HP) - healthy
    - Yellow (30-59% HP) - low
    - Orange (<30% HP) - critical with pulse animation
    - Gray (0% HP) - dead

**Result**: Overlay now shows:
```
⭐ Golden Juggernaut - 5 alive
[15: 25%] [23: 42%] [7: 58%] [31: 65%] [9: 89%]

⭐ Frost Ogre - 3 alive
[12: 15%] [8: 33%] [19: 76%]
```

---

### 2. **Fixed "Show Only Subscribed" Checkbox**
**Issue**: Checkbox in main window did nothing  
**Fix**: Wired up event listener and filter logic

**Changes**:
- `src/windows/main/renderer.js`
  - Added `showOnlySubscribed` variable
  - Added `showOnlySubscribedCheckbox` DOM element reference
  - Created `handleShowOnlySubscribedChange()` function
  - Updated `renderBosses()` to filter by subscription when checked

**Result**: Checkbox now properly filters boss list to show only starred/subscribed bosses.

---

### 3. **Added Boss Images Support**
**Issue**: No visual representation of bosses  
**Fix**: Added image display with fallback handling

**Changes**:
- `src/windows/main/renderer.js`
  - Added `getBossImagePath(bossName, mobType)` helper function
  - Added `toSnakeCase(text)` converter (e.g., "Golden Juggernaut" → "golden_juggernaut")
  - Updated `renderBossCardAsync()` to include `<div class="boss-avatar">` with image
  - Image path: `./images/bosses/{snake_case_name}.webp`
  - `onerror` handler hides image if file doesn't exist

- `src/windows/main/styles.css`
  - `.boss-avatar` - 60x60px rounded container
  - Border with gradient effect
  - Flex-shrink to prevent squishing

- `images/README.md` - Documentation
  - Lists all 14 boss names
  - Image naming convention
  - Where to get images (bptimer.com)
  - Fallback behavior

**Result**: Boss cards now show images (when available) in a 60x60px rounded avatar next to the boss name.

---

## 🔧 Technical Details

### API Changes
- Overlay now uses:
  - `window.electronAPI.getBosses()` - Get all boss data
  - `window.electronAPI.getAliveChannels(bossId)` - Get channels with HP > 0
  - Real-time updates via `onChannelUpdate` event

### File Structure
```
f:\Projects\BPSR_MONSTER_INGAM\
├── src/
│   ├── windows/
│   │   ├── overlay/
│   │   │   ├── renderer.js  ✏️ REWRITTEN
│   │   │   └── styles.css   ✏️ UPDATED
│   │   └── main/
│   │       ├── renderer.js  ✏️ UPDATED
│   │       └── styles.css   ✏️ UPDATED
│   └── services/
│       └── api-service.js   ✅ (from previous fix)
└── images/
    ├── README.md           ✨ NEW
    ├── bosses/             📁 (empty - needs images)
    └── magical-creatures/  📁 (empty - for future use)
```

---

## 📋 Boss Names (All 14)

1. Golden Juggernaut
2. Frost Ogre
3. Inferno Ogre
4. Phantom Arachnocrab
5. Brigand Leader
6. Venobzzar Incubator
7. Muku Chief
8. Iron Fang
9. Storm Goblin King
10. Tempest Ogre
11. Celestial Flier
12. Lizardman King
13. Goblin King
14. Muku King

---

## 🚀 Next Steps (Not Implemented Yet)

### 4. Event Timers
Add section for game events with countdown timers:
- Guild Hunt (Fri-Sun, 14:00 UTC, 14h duration)
- World Boss (Daily, 16:00 UTC, 6h duration)
- Guild Dance (Fri-Sun, 14:00 UTC)
- Stimen Vaults
- Daily Reset
- Weekly Reset

Reference: `apps/web/src/lib/utils/event-timer.ts` from bptimer repo

### 5. Magical Creatures
Add tracking for special magical creatures:
- Lovely Boarlet (respawns: 12:00, 16:00, 20:00 UTC)
- Breezy Boarlet (respawns: 14:00, 18:00, 22:00 UTC)
- Loyal Boarlet (8 locations)
- Golden Nappo (6 locations)
- Silver Nappo (11 locations)

Reference: `MAGICAL_CREATURE_RESET_HOURS` and `SPECIAL_MAGICAL_CREATURES` from bptimer constants

---

## 🧪 Testing

To test the changes:

1. **Overlay Test**:
   - Click "Show Overlay" button
   - Subscribe to a boss (click ★)
   - Check if boss appears in overlay with alive channels
   - Verify HP color coding (green/yellow/orange/gray)

2. **Subscription Filter Test**:
   - Subscribe to 2-3 bosses
   - Check "Show only subscribed" checkbox
   - Verify only subscribed bosses appear
   - Uncheck - all bosses should reappear

3. **Boss Images Test**:
   - Download/place images in `images/bosses/` folder
   - Verify images appear as 60x60px avatars
   - Test with missing image - should hide gracefully

---

## 📝 Notes

- App now uses `mob_channel_status` collection (not `_sse`) for accuracy
- Stale data filtering implemented with HP-based timeouts
- Overlay auto-refreshes every 5 seconds
- Images are optional - app works without them
- All changes maintain compatibility with existing PocketBase API
