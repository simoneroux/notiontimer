# Sync Pomodoro Timer

A beautiful, synchronized Pomodoro timer that works across all your devices in real-time using Firebase.

## Features

- **Real-time Sync**: Timer state syncs across all your devices instantly
- **Beautiful UI**: Clean, modern interface with animated timer wheel
- **Offline Support**: Works offline and syncs when you're back online
- **Cross-device**: Share the same timer across phone, tablet, and computer
- **Simple**: No login required - just open and start timing

## Quick Start Guide

### Step 1: Set Database Rules

1. Go to your [Firebase Database](https://console.firebase.google.com/u/0/project/notiontimer-d1b19/database/notiontimer-d1b19-default-rtdb/data)
2. Click the **"Rules"** tab
3. Replace the rules with this:

```json
{
  "rules": {
    "timers": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. Click **"Publish"**

⚠️ **Note**: These rules allow anyone to read/write. For personal use this is fine, but for production you'd want to add authentication.

### Step 2: Access Your Timer

**Option A - GitHub Pages (Recommended):**
Visit: [Your GitHub Pages URL will be here once deployed]

**Option B - Run Locally:**
1. Clone this repository
2. Open `index.html` in your browser
3. Or run a local server:
   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx http-server
   ```

### Step 3: Test Multi-Device Sync

**Same Browser Test:**
1. Open the timer in one browser tab
2. Start the timer
3. Open the timer in a new tab
4. Both timers should sync! 🎉

**Different Devices:**
1. Open the timer on your first device
2. Click the ⚙️ settings button to see your User ID
3. On your second device:
   - Open browser console (F12)
   - Type: `localStorage.setItem('userId', 'YOUR_USER_ID_HERE')`
   - Reload the page
4. Both devices now share the same timer!

## How to Use

- **Play/Pause** (▶️): Start or stop the timer
- **Previous** (⏮): Add 1 minute
- **Next** (⏭): Remove 1 minute
- **Back** (←): Reset to 25 minutes
- **Settings** (⚙️): View your User ID for syncing
- **Harp** (🔔): Test the completion sound

## Sync Status

Top-right indicator shows:
- 🟢 **Synced**: Connected, changes saving to Firebase
- 🟡 **Syncing...**: Currently uploading changes
- 🔴 **Offline**: Using local storage only

## Troubleshooting

### Shows "Offline" instead of "Synced"

1. Check Firebase rules are set (Step 1 above)
2. Open browser console (F12) - look for errors
3. If using local files, run a local server instead

### Timer doesn't sync between devices

1. Make sure both devices are using the same User ID
2. Check that both devices show "Synced" (green dot)
3. Verify Firebase rules are published

## Technical Details

**Built with:**
- Vanilla JavaScript (ES6 modules)
- Firebase Realtime Database
- CSS3 animations
- SVG graphics

**Browser Support:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Firebase Configuration

This timer is pre-configured with Firebase project: `notiontimer-d1b19`

If you want to use your own Firebase project:
1. Create a new Firebase project
2. Enable Realtime Database
3. Replace the `firebaseConfig` in `timer.js` with your own config

## Privacy

- No data is collected beyond the timer state (remaining seconds, running status)
- User IDs are randomly generated and stored locally
- Timer data is stored at `timers/[userId]` in Firebase
- No analytics or tracking

## Tips

1. **Keep User ID Safe**: Your timer state is linked to your User ID. Save it somewhere safe!
2. **Share with Others**: Others can use the timer too - they'll get their own User ID automatically
3. **Multiple Timers**: Want separate timers for work/personal? Just use different User IDs
4. **Mobile**: Works great on mobile browsers! Consider adding to home screen for quick access

## License

MIT License - Feel free to use and modify as you wish!

## Support

Found a bug or have a feature request? Open an issue on GitHub!
