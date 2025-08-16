const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

class VelrathApp {
  constructor() {
    this.mainWindow = null;
    this.isDev = process.argv.includes('--dev');
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      icon: path.join(__dirname, '../assets/Icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      show: false
    });

    this.mainWindow.loadFile(path.join(__dirname, 'views/splash.html'));

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      if (this.isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  setupIPC() {
    // Window controls
    ipcMain.handle('window-minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window-close', () => {
      this.mainWindow?.close();
    });

    // Navigation
    ipcMain.handle('navigate-to-dashboard', () => {
      this.mainWindow?.loadFile(path.join(__dirname, 'views/dashboard.html'));
    });

    ipcMain.handle('navigate-to-login', () => {
      this.mainWindow?.loadFile(path.join(__dirname, 'views/login.html'));
    });

    // Discord API integration
    ipcMain.handle('discord-login', async (event, token) => {
      try {
        const axios = require('axios');
        
        // First try as user token
        let response;
        try {
          response = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          });
        } catch (userError) {
          // If user token fails, try as bot token
          response = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
              'Authorization': `Bot ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
        
        // Get additional user info
        const userGuilds = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
          headers: {
            'Authorization': token.startsWith('Bot ') ? token : token,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ data: [] }));
        
        const userData = {
          ...response.data,
          guild_count: userGuilds.data.length || 0
        };
        
        return { success: true, user: userData };
      } catch (error) {
        console.error('Discord login error:', error.response?.data || error.message);
        return { 
          success: false, 
          error: error.response?.data?.message || 'Invalid token. Please check your Discord token.' 
        };
      }
    });
  }

  init() {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIPC();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

const velrathApp = new VelrathApp();
velrathApp.init();