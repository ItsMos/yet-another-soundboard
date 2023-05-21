import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import fs from 'fs'
import { Store } from './dataStore'
let whisperAsync, whisperParams
import('./whisper').then(m => {
  whisperAsync = m.whisperAsync
  whisperParams = m.whisperParams
})
const dataStore = new Store()

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // nodeIntegration: true,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  // const keybinds = {
    // 'Alt+3': 'laughter',
    // '0': 'hello there obi wan',
    // '9': 'emotional damage'
  // }
  const keybinds = dataStore.get('keybinds')

  for (const bind in keybinds) {
    globalShortcut.register(bind, () => {
      win.webContents.send('play', keybinds[bind])
    })
  }

  // globalShortcut.register('Control+3', () => {
  //   win.webContents.send('captureMicAudio')
  // })
  win.webContents.on('focus', () => {
    win.webContents.send('focusSearch')
  })
  globalShortcut.register('Control+2', () => {
    win.webContents.send('stop')
  })

  // console.log(join(process.cwd(), 'command.wav'))
  ipcMain.on('saveMicAudio', (ev, audio) => {
    try {
      fs.writeFileSync('command.wav', Buffer.from(audio))
      whisperParams.fname_inp = 'command.wav'
      whisperAsync(whisperParams).then(res => {
        res = res.map(line => line.slice(-1)) // remove timestamps

        res = res.join('')
          .replace(/\(.+\)/g, '')
          .replace(/\[.+\]/g, '')
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .trim()
        console.log('text:', res)
        win.webContents.send('play', res)
      })
    } catch (error) {
      console.error(error)
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.handle('newBind', (ev, bind: string, sound: string) => {
  console.log('binding '+ bind + ' to ' + sound)
  console.log('store:')
  const keybinds = dataStore.get('keybinds')
  keybinds[bind] = sound
  dataStore.set('keybinds', keybinds)
  // console.log(dataStore.get('keybinds'))

  return globalShortcut.register(bind, () => {
    win.webContents.send('play', sound)
  })
})

ipcMain.handle('removeBind', (ev, key) => {
  globalShortcut.unregister(key)
  const keybinds = dataStore.get('keybinds')
  delete keybinds[key]
  dataStore.set('keybinds', keybinds)
})

ipcMain.handle('getData', (ev) => {
  return dataStore.data
})
