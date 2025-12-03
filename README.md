# Sync Pomodoro Timer ⏱️

A beautiful, synchronized Pomodoro timer that works across all your devices in real-time using Supabase. Focus better, work smarter. Now with a dedicated Desktop Widget mode!

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Real-time Sync
- **Cross-device synchronization**: Timer state syncs instantly across all your devices using **Supabase**.
- **Reliable Backend**: Uses Supabase Realtime for sub-second latency.
- **Offline support**: Continues working offline with localStorage fallback.
- **Auto-recovery**: Automatically calculates correct time when reconnecting.

### Interactive UI
- **Touch-friendly Dial**: Drag the handle or click anywhere on the ring to set the time.
- **Dynamic Visuals**: Beautiful gradient dial that updates as time passes.
- **Responsive**: Works on desktop, tablet, and mobile.
- **Wake Lock**: Prevents your device from sleeping while the timer is running (supported browsers).

### Desktop Widget (Electron)
- **Always on Top**: Floats above your other windows so you never lose track of time.
- **Tiny Mode**: Unobtrusive 180x180px widget.
- **Settings Mode**: Expands for configuration, then shrinks back to widget size.
- **Tray Support**: Native integration for macOS/Windows.

### Sound & Alerts
- **Zen Gong**: Calming start sound (`zengong1.mp3`).
- **Harp Alarm**: Gentle but effective completion sound (`harp.mp3`).
- **Ticking Sound**: Optional rhythmic ticking for deep focus (`tick.mp3`).
- **Volume Control**: Independent volume sliders for alarm and ticking sounds.

## 🚀 Quick Start

### Option 1: Web Version (No Installation)
Simply open `index.html` in any modern browser.

For the best experience (to avoid CORS issues with some features), run a local server:

```bash
# Python
python3 -m http.server 8000
# Then visit: http://localhost:8000

# Node.js
npx http-server
# Then visit: http://localhost:8080
```

### Option 2: Desktop App (Electron)

Since this project contains a `main.js` for Electron, you can run it as a desktop app.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the App**
   ```bash
   npm start
   ```

## 🛠️ Configuration

### Supabase Setup (Required for Sync)

The timer uses Supabase for synchronization. The current configuration is hardcoded in `index.html`, but you can use your own project:

1. **Create a Supabase Project**: Go to [database.new](https://database.new).
2. **Create Table**: Run the following SQL in the SQL Editor:

   ```sql
   create table timers (
     id text primary key,
     end_time bigint,
     is_running boolean,
     paused_remaining bigint,
     task_name text,
     session_id text,
     updated_at bigint
   );
   
   -- Enable Realtime
   alter publication supabase_realtime add table timers;
   ```

3. **Update Credentials**:
   Edit `index.html` (around line 279) and replace `SUPABASE_URL` and `SUPABASE_KEY` with your own.

### Settings

Click the **Gear Icon** (or right-click in the Desktop app) to access settings:
- **Sync ID**: Share this ID with other devices to sync them.
- **Sounds**: Toggle sounds on/off and adjust volumes.
- **Always on Top**: (Desktop only) Keep the timer visible.

## 📖 How to Use

### Basic Controls
- **▶️ Play/Pause**: Start or stop the timer.
- **Drag Dial**: Drag the white knob to set any duration (0-60 min).
- **Click Dial**: Tap anywhere on the ring to jump to that time.
- **Reset**: Click the reset button to return to 25:00.
- **+1 Min**: Quickly add a minute to the current timer.

### Multi-Device Sync
1. Open settings on Device A and copy the **Sync ID**.
2. Open settings on Device B, paste the ID, and click **Save**.
3. Both devices are now linked! Start the timer on one, and the other follows.

## 🔧 Technical Details

- **Frontend**: Vanilla HTML/CSS/JS (ES6 Modules).
- **Backend**: Supabase (PostgreSQL + Realtime).
- **Desktop**: Electron (with IPC for window resizing).
- **Audio**: Web Audio API for low-latency playback.

## 🐛 Troubleshooting

### Timer shows "Offline" / Doesn't Sync
- Check your internet connection.
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct in `index.html`.
- Ensure the `timers` table exists and Realtime is enabled in Supabase.

### Audio not playing
- **iOS/Mobile**: Tap the screen once to unlock audio context.
- **Desktop**: Check the volume sliders in Settings.

### Desktop App Window Issues
- If the window looks cut off, try resizing or restarting the app. The app uses dynamic resizing which can sometimes be tricky on different OS scalings.

## 📜 License

MIT License - feel free to use, modify, and distribute!
