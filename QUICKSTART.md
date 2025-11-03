# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies (Already Done!)
```bash
npm install
```

### 2. Run the Application
```bash
npm start
```

Or with Developer Tools enabled:
```bash
npm run dev
```

### 3. Use the App
1. The main window will open showing all Blue Protocol bosses
2. Click **"Show Overlay"** to enable the in-game overlay
3. The overlay will appear in the top-right corner of your screen
4. Drag the overlay to reposition it
5. Adjust opacity with the slider in the overlay footer

## What You'll See

### Main Window
- **Active Timers** section shows bosses that are currently on respawn timers
- **All Bosses** section displays the complete boss database
- Use the **Map Filter** to filter by location
- Use the **Search** box to find specific bosses
- Click **Refresh** to manually update data

### Overlay
- Shows up to 8 most urgent timers
- Color-coded by urgency:
  - 🔴 Red = Less than 3 minutes (Critical)
  - 🟠 Orange = 3-5 minutes (Urgent)  
  - 🟡 Yellow = 5-10 minutes (Soon)
  - 🔵 Blue = More than 10 minutes (Normal)

## Real-time Updates

The app automatically connects to bptimer.com's real-time API:
- No need to manually refresh
- Boss kills and respawns update instantly
- Channel status syncs automatically
- Connection status shown in the main window

## Tips

1. **Position the overlay** where it doesn't block important UI elements in the game
2. **Adjust opacity** if the overlay is too prominent or hard to see
3. **Keep the main window open** while gaming to track more bosses
4. **Use map filters** to focus on the area you're currently farming

## Troubleshooting

**App won't start?**
- Make sure you ran `npm install`
- Check that Node.js is properly installed

**No data showing?**
- Check your internet connection
- Make sure bptimer.com is accessible
- Click the Refresh button

**Overlay not visible?**
- Click "Show Overlay" in the main window
- The overlay might be off-screen - close and reopen it
- Try adjusting the opacity slider

## Building for Distribution

To create an installable .exe:
```bash
npm run build
```

The installer will be created in the `dist` folder.

---

Enjoy tracking those boss spawns! 🎮⏰
