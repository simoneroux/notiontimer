# Sync Pomodoro Timer ⏱️

A beautiful, synchronized Pomodoro timer that works across all your devices in real-time using Firebase. Focus better, work smarter.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Real-time Sync
- **Cross-device synchronization**: Timer state syncs instantly across all your devices
- **Firebase integration**: Reliable real-time database ensures no data loss
- **Offline support**: Continues working offline with localStorage fallback
- **Auto-recovery**: Automatically calculates correct time when reconnecting

### Customizable Timers
- **7 preset durations**: 5, 10, 15, 25, 30, 45, and 60 minutes
- **Quick switching**: Change timer duration with one click
- **Dynamic wheel**: Timer wheel adapts to show numbers for your selected duration
- **Persistent settings**: Your preferences are saved automatically

### Sound Alerts
Choose from 6 professionally designed alert sounds:
- 🔔 **Bell** - Classic three-tone bell sound
- 🎐 **Chime** - Gentle musical chime (C-E-G chord)
- 📟 **Digital** - Sharp double beep
- 🌸 **Gentle** - Soft, calming tone
- 🌿 **Nature** - Bird chirp simulation
- ⚡ **Alert** - Urgent triple alert

### Modern UI
- **Beautiful design**: Clean, minimalist interface
- **Animated wheel**: Visual progress with rotating handle
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark theme**: Easy on the eyes for long work sessions
- **Smooth animations**: Polished interactions and transitions

### Smart Features
- **Browser notifications**: Get notified when timer completes
- **Manual adjustments**: Fine-tune with +/- 1 minute buttons
- **Quick reset**: Back button resets to preset duration
- **Test sounds**: Preview alert sounds before selecting

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
Visit: [Your deployed URL here]

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/simoneroux/notiontimer.git
   cd notiontimer
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser, or
   - Run a local server (recommended for full functionality):

   ```bash
   # Python
   python -m http.server 8000
   # Then visit: http://localhost:8000

   # Node.js
   npx http-server
   # Then visit: http://localhost:8080
   ```

### Firebase Setup (Required)

The timer uses Firebase Realtime Database for synchronization. Follow these steps:

1. **Go to Firebase Console**
   - Visit: [Firebase Database Rules](https://console.firebase.google.com/u/0/project/notiontimer-d1b19/database/notiontimer-d1b19-default-rtdb/data)
   - Click the **"Rules"** tab

2. **Set Database Rules**
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

3. **Click "Publish"**

⚠️ **Note**: These rules allow public read/write access. For personal use this is fine. For production, implement proper authentication.

## 📖 How to Use

### Basic Controls

- **▶️ Play/Pause** - Start or stop the timer
- **⏮ Previous** - Add 1 minute to current time
- **⏭ Next** - Subtract 1 minute from current time
- **← Back** - Reset to selected preset duration
- **⚙️ Settings** - Configure sound and view sync ID

### Setting Up Multi-Device Sync

**Same Browser Test:**
1. Open timer in one tab
2. Start the timer
3. Open timer in another tab
4. Both timers sync automatically! 🎉

**Different Devices:**
1. Open timer on your first device
2. Click **⚙️ Settings**
3. Copy your **Sync ID**
4. On second device, open **Browser Console** (F12)
5. Type: `localStorage.setItem('userId', 'YOUR_SYNC_ID_HERE')`
6. Reload the page
7. Both devices now share the same timer!

### Changing Timer Duration

Click any preset button (5min, 10min, 15min, etc.) to switch timer duration. If a timer is running, you'll be asked to confirm before switching.

### Choosing Alert Sound

1. Click **⚙️ Settings**
2. Under "Alert Sound", click any sound option
3. It will play automatically so you can preview
4. Your choice is saved automatically

## 🎯 Use Cases

- **Pomodoro Technique**: 25-minute focus sessions with 5-minute breaks
- **Meeting Timer**: Keep presentations on track
- **Study Sessions**: Structured learning with breaks
- **Workout Intervals**: HIIT or circuit training
- **Meditation**: Timed mindfulness sessions
- **Cooking**: Kitchen timer that syncs to your phone

## 🔧 Technical Details

### Built With
- **Vanilla JavaScript** (ES6 modules) - No frameworks, pure performance
- **Firebase Realtime Database** - Real-time synchronization
- **Web Audio API** - High-quality procedural sounds
- **CSS3 Animations** - Smooth, hardware-accelerated
- **SVG Graphics** - Crisp visuals at any resolution

### Browser Support
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Architecture

```
timer.js
├── Firebase Integration
│   ├── Real-time sync
│   ├── State management
│   └── Offline fallback
├── Sound System
│   ├── 6 procedural sounds
│   └── Web Audio API
├── Timer Logic
│   ├── Preset management
│   ├── Countdown mechanism
│   └── Progress tracking
└── UI Management
    ├── Dynamic wheel numbers
    ├── Progress animation
    └── Settings modal
```

## 🎨 Customization

### Using Your Own Firebase Project

1. Create a new Firebase project at [Firebase Console](https://console.firebase.com)
2. Enable Realtime Database
3. Replace the `firebaseConfig` in `timer.js` (lines 6-15):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Adding More Presets

Edit the `TIMER_PRESETS` array in `timer.js` (line 18):

```javascript
const TIMER_PRESETS = [
    { label: '5 min', minutes: 5 },
    { label: '90 min', minutes: 90 },  // Add your custom preset
    // ... more presets
];
```

### Customizing Colors

Edit the CSS variables in `index.html`:
- Primary color: `#ff6b5a` (timer handle and accents)
- Background: `#000` (pure black)
- Text: `#fff` (white)

## 🔒 Privacy & Security

- **No tracking**: No analytics, no data collection
- **Local-first**: Preferences stored in browser localStorage
- **Minimal data**: Only timer state synced (seconds remaining, running status)
- **Anonymous**: User IDs are random, not linked to personal info
- **Open source**: All code is visible and auditable

## 🐛 Troubleshooting

### Timer shows "Offline" instead of "Synced"

**Solutions:**
1. Verify Firebase rules are published (see Firebase Setup above)
2. Check browser console (F12) for errors
3. If using `file://` protocol, use a local server instead
4. Clear browser cache and reload

### Timer doesn't sync between devices

**Solutions:**
1. Ensure both devices use the same Sync ID
2. Check both devices show "Synced" (green dot)
3. Verify Firebase rules allow read/write access
4. Check internet connection on both devices

### No sound plays when timer completes

**Solutions:**
1. Check browser sound settings (not muted)
2. Try clicking "Test Sound" in settings
3. Some browsers block audio until user interaction - click the page first
4. Check browser console for Web Audio API errors

### Numbers don't show on timer wheel

**Solutions:**
1. Try a different timer preset
2. Check browser console for JavaScript errors
3. Clear cache and hard reload (Ctrl+Shift+R)

## 💡 Tips & Tricks

1. **Mobile Home Screen**: Add to your phone's home screen for quick access
2. **Multiple Timers**: Use different Sync IDs for separate timers (work/personal)
3. **Keyboard Shortcut**: Bookmark with Ctrl+D for instant access
4. **Privacy Mode**: Use without syncing - works offline perfectly
5. **Custom Duration**: Use +/- buttons to fine-tune any preset
6. **Sound Preview**: Click sounds in settings to hear before selecting

## 🤝 Contributing

Contributions welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Acknowledgments

- Firebase for real-time database
- Web Audio API for sound synthesis
- Pomodoro Technique by Francesco Cirillo
- The open-source community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/simoneroux/notiontimer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/simoneroux/notiontimer/discussions)

---

**Made with ❤️ for productivity enthusiasts**

Stay focused. Work smart. Take breaks.
