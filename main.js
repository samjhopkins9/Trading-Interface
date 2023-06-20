const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: 'Trading Interface',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('index.html');

  // Uncomment the following line if you want to open the DevTools automatically
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
