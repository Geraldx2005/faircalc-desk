const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onDownloadStarted: (cb) => ipcRenderer.on("download-started", (_, f) => cb(f)),
  onDownloadComplete: (cb) => ipcRenderer.on("download-complete", (_, f) => cb(f)),
  onDownloadFailed: (cb) => ipcRenderer.on("download-failed", (_, f) => cb(f)),
  startElectronDownload: (url) => ipcRenderer.send("electron-download", url),
});
