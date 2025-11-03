# 🎮 Blue Protocol Star Resonance - Enhanced Features Update

## ✨ New Features Added

### 1. **Custom Title Bars** (No Default Menu Bar)
- ✅ Both Main and Overlay windows now have custom title bars
- ✅ Window controls: Minimize, Maximize/Restore, Close
- ✅ Draggable title bar area
- ✅ Sleek, modern design matching app theme

### 2. **Boss Subscription System** ⭐
- ✅ **Subscribe to specific bosses** by clicking the star icon on boss cards
- ✅ Subscribed bosses are highlighted with a golden border
- ✅ Receive **desktop notifications** for subscribed bosses at:
  - 5 minutes before spawn
  - 1 minute before spawn
- ✅ Filter main window to show only subscribed bosses
- ✅ Overlay defaults to showing only subscribed boss timers

### 3. **Channel Status Display** 💀✅
- ✅ **Live channel tracking** for each boss
- ✅ See which channels have the boss **alive** (✅)
- ✅ See which channels are being **tracked** with timers (⏱️)
- ✅ See which channels have **killed** bosses (💀)
- ✅ **Expandable channel list** showing individual channel status
- ✅ Real-time countdown for each channel

### 4. **Enhanced Overlay**
- ✅ Toggle between "Show All" and "Show Subscribed Only" modes
- ✅ Filter button (⭐/📋) in overlay header
- ✅ Subscribed timers highlighted with golden glow
- ✅ Empty state shows helpful message to subscribe to bosses

### 5. **Notifications**
- ✅ Browser desktop notifications for subscribed bosses
- ✅ In-app toast notifications
- ✅ Automatic notification permission request

## 🎯 How to Use New Features

### Subscribing to Bosses

1. **Find a boss** in the "All Bosses" section
2. **Click the star button (☆)** on the boss card
3. The star turns **golden (⭐)** and the card gets a golden border
4. You'll now receive notifications for that boss!

### Viewing Channel Status

Each boss card now shows:
- **Alive**: Number of channels where boss is currently alive
- **Tracking**: Number of channels with active respawn timers
- **Killed**: Number of channels where boss was recently killed

**To see individual channels:**
1. Click "Show Channels" button on any boss card
2. View all channels with their individual status
3. See countdown timers for each channel

### Using the Overlay

**Default Behavior:**
- Overlay shows only **subscribed boss timers** by default
- Perfect for focusing on bosses you care about!

**Toggle Filter:**
- Click the **⭐ button** in overlay header to show all timers
- Click again to return to subscribed-only mode
- Icon changes: ⭐ (subscribed only) ↔️ 📋 (all timers)

### Managing Notifications

**First Time:**
- App will request notification permission
- Click "Allow" to receive alerts

**Notification Timing:**
- **5 minutes** before spawn: "Boss spawning in 5 minutes on Ch X!"
- **1 minute** before spawn: "Boss spawning in 1 minute on Ch X!"

## 🎨 Visual Updates

### Main Window
```
┌─────────────────────────────────────┐
│ 🎮 Blue Protocol Star Resonance  ─☐✕│ ← Custom title bar
├─────────────────────────────────────┤
│  Header with controls                │
│  ┌─────────────────────────────┐    │
│  │ 👹 Golden Juggernaut    ⭐ #1│    │
│  │ Map: Asteria Plains          │    │
│  │ Respawn: 0 min              │    │
│  │ ──────────────────────────   │    │
│  │ ✅ Alive: 150  ⏱️ Tracking: 5│    │
│  │ 💀 Killed: 10                │    │
│  │ [▼ Show Channels (15)]       │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Overlay Window
```
┌──────────────────────┐
│⏰ BP Timers   ⭐ ✕   │ ← Custom header with filter
├──────────────────────┤
│ ⭐ Frost Ogre        │
│ Asteria  Ch 42  2:30 │ ← Subscribed (gold glow)
├──────────────────────┤
│ Iron Fang            │
│ Windhowl Ch 15  5:12 │ ← Regular timer
└──────────────────────┘
```

## 🔔 Subscription Workflow

### Step-by-Step Guide

1. **Start the App**
   ```bash
   npm start
   ```

2. **Browse Bosses**
   - Scroll through the "All Bosses" section
   - Or use map filter/search to find specific bosses

3. **Subscribe to Favorites**
   - Click the **star button (☆)** on bosses you want to track
   - Star turns golden ⭐ when subscribed
   - Card border turns golden

4. **Filter View (Optional)**
   - Check "Show only subscribed" to see just your favorites
   - Perfect for focused farming!

5. **Enable Overlay**
   - Click "Show Overlay" button
   - Overlay appears in top-right (drag to reposition)
   - Shows only subscribed timers by default

6. **Watch for Notifications**
   - When subscribed bosses are killed, you'll see:
     - Timer appears in overlay
     - 5-minute warning notification
     - 1-minute warning notification

## 📋 Keyboard & Mouse Controls

### Main Window
- **Drag Title Bar**: Move window
- **Click Minimize**: Minimize to taskbar
- **Click Maximize**: Toggle fullscreen
- **Click Close**: Close application
- **Click Star**: Toggle boss subscription
- **Click "Show Channels"**: Expand/collapse channel list

### Overlay
- **Drag Header**: Reposition overlay
- **Click ⭐/📋**: Toggle filter mode
- **Click ✕**: Close overlay
- **Opacity Slider**: Adjust transparency

## 🎯 Pro Tips

1. **Subscribe to Event Bosses** (0 min respawn)
   - These are special encounters
   - Get notified when they appear

2. **Filter by Map**
   - Select your current farming map
   - See only relevant bosses

3. **Use "Show Only Subscribed"**
   - Keep your boss list clean
   - Focus on what matters

4. **Position Overlay Strategically**
   - Place where it won't block UI
   - Adjust opacity if needed
   - Use subscribed-only mode to reduce clutter

5. **Check Channel Details**
   - Expand channels to see which are free
   - Plan your farming route
   - Switch to less populated channels

## 🆕 What Changed from Original

| Feature | Before | After |
|---------|--------|-------|
| Menu Bar | Default Electron | ✅ Custom title bar |
| Boss Cards | Basic info only | ✅ Channel status bars |
| Channels | Not visible | ✅ Expandable list per boss |
| Filtering | Map/Search only | ✅ + Subscription filter |
| Overlay | All timers | ✅ Subscribed-only default |
| Notifications | None | ✅ Desktop + In-app alerts |
| Boss Focus | Not possible | ✅ Star/Subscribe system |

## 🐛 Troubleshooting

### Notifications Not Working
- Check browser notification permissions
- Windows: Settings → Notifications → Allow apps
- Click "Allow" when prompted by app

### Channel Data Not Showing
- Data comes from bptimer.com API
- Some bosses may not have active trackers yet
- Wait for community to report kills

### Subscriptions Not Saving
- Subscriptions are stored in memory
- Lost on app restart (feature enhancement idea!)
- Re-subscribe after restarting app

### Overlay Not Showing Bosses
- Make sure you've subscribed to at least one boss (⭐)
- Click filter button (⭐/📋) to toggle show all mode
- Check if there are any active timers

## 📱 Screenshot Guide

### Subscribe to a Boss
1. Find boss card
2. Click ☆ star button
3. Star becomes ⭐ (golden)
4. Card gets golden border

### View Channels
1. Click "Show Channels" on boss card
2. See list of all channels
3. Green = Alive, Red = Timer active
4. Real-time countdown for each

### Overlay Filter
1. Click ⭐ in overlay header (subscribed only)
2. Click 📋 to show all timers
3. Icon indicates current mode

## 🚀 Quick Start with New Features

```bash
# Run the app
npm start

# In the main window:
# 1. Click ⭐ on "Frost Ogre" card
# 2. Click ⭐ on "Iron Fang" card
# 3. Check "Show only subscribed" checkbox
# 4. Click "Show Overlay" button

# In the overlay:
# - You'll see only Frost Ogre and Iron Fang timers
# - Both will have ⭐ badge
# - Click ⭐ button to toggle showing all bosses
```

## 💡 Feature Highlights

### Smart Filtering
- Main window: Optional filter to show only subscribed
- Overlay: Defaults to subscribed-only for cleaner display
- Quick toggle without losing your subscriptions

### Channel Intelligence
- See total channels per map
- Live tracking of boss status
- Individual channel timers
- Make informed decisions about which channel to farm

### Focused Farming
- Subscribe to 3-5 bosses you're farming
- Overlay shows only those
- Get notifications for critical spawns
- Ignore bosses you don't care about

Enjoy the enhanced boss tracking experience! 🎮⏰⭐
