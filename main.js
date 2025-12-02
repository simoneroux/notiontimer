const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron')
const path = require('path')

// Store the window position before we center it for settings
let originalPosition = null

function createWindow () {
  const win = new BrowserWindow({
    width: 180,        // Tiny mode
    height: 180,       // Tiny mode
    transparent: true, // Invisible square background
    frame: false,      // No title bar
    alwaysOnTop: true, // Floats on top
    resizable: false,  // Fixed size
    hasShadow: false,  // No shadow
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Required for ipcRenderer in index.html
    }
  })

  // Ensure it starts on top with the correct level
  win.setAlwaysOnTop(true, 'floating')
  win.loadFile('index.html')
}

// --- IPC HANDLERS ---

// 1. Resize for Settings (Save Position & Center)
ipcMain.on('set-settings-mode', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    // Save current position
    originalPosition = win.getPosition()
    
    win.setResizable(true)
    win.setSize(350, 500, false) // false = no animation
    win.center()
  }
})

// 2. Shrink back to Widget (Restore Position)
ipcMain.on('set-small-mode', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.setSize(180, 180, false) // false = no animation
    win.setResizable(false)
    win.setAlwaysOnTop(true, 'floating') // Re-assert always on top when shrinking
    
    // Restore original position if we have one
    if (originalPosition) {
      win.setPosition(originalPosition[0], originalPosition[1], false) // false = no easing/animation
    }
  }
})

// 3. Toggle Always on Top
ipcMain.on('set-always-on-top', (event, isAlwaysOnTop) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    // 'floating' level is required on macOS to stay above other standard windows
    win.setAlwaysOnTop(isAlwaysOnTop, 'floating')
  }
})

// --- CREATE CUSTOM MENU ---
function createMenu() {
  const isMac = process.platform === 'darwin'

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { 
            label: 'Settings...', 
            accelerator: 'CmdOrCtrl+,', 
            click: async () => {
                const win = BrowserWindow.getFocusedWindow()
                if(win) win.webContents.send('open-settings')
            } 
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createMenu() 
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})