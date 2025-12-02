const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

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

  win.loadFile('index.html')
}

// --- CREATE CUSTOM MENU ---
function createMenu() {
  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { 
            label: 'Settings...', 
            accelerator: 'CmdOrCtrl+,', // Standard Mac shortcut
            click: async () => {
                // Send a message to index.html to open the modal
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
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'viewMenu' } - Useful for debugging if needed
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
  createMenu() // <--- Build the menu before creating window
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