import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script — 通过 contextBridge 向渲染进程暴露安全的 API
 * 配合 contextIsolation: true 使用，避免直接暴露 ipcRenderer 或 Node API
 */
contextBridge.exposeInMainWorld('api', {
  // Store operations
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.send('store-set', key, value),
  storeDelete: (key) => ipcRenderer.send('store-delete', key),

  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),

  // Mini mode
  enterMiniMode: () => ipcRenderer.send('enter-mini-mode'),
  leaveMiniMode: () => ipcRenderer.send('leave-mini-mode'),
});
