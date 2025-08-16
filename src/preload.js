const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),

  // Navigation
  navigateToDashboard: () => ipcRenderer.invoke('navigate-to-dashboard'),
  navigateToLogin: () => ipcRenderer.invoke('navigate-to-login'),

  // Discord API
  discordLogin: (token) => ipcRenderer.invoke('discord-login', token),

  // Storage
  setStore: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  getStore: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  removeStore: (key) => {
    localStorage.removeItem(key);
  }
});