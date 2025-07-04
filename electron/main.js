
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load the built React app
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading app from:', indexPath);
    
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load app:', err);
      
      // Fallback paths to try
      const fallbackPaths = [
        path.join(process.resourcesPath, 'app/dist/index.html'),
        path.join(process.resourcesPath, 'dist/index.html'),
        path.join(__dirname, 'dist/index.html')
      ];
      
      let loaded = false;
      for (const fallbackPath of fallbackPaths) {
        if (!loaded) {
          try {
            console.log('Trying fallback path:', fallbackPath);
            mainWindow.loadFile(fallbackPath).then(() => {
              loaded = true;
              console.log('Successfully loaded from:', fallbackPath);
            }).catch(fallbackErr => {
              console.error('Fallback failed:', fallbackPath, fallbackErr);
            });
          } catch (e) {
            console.error('Error with fallback:', e);
          }
        }
      }
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    app.quit();
  });

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Hide menu bar for cleaner look
Menu.setApplicationMenu(null);

// Handle certificate errors in development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
