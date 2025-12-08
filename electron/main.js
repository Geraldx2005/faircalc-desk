import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Preload path:", path.join(__dirname, "../electron/preload.cjs"));

import { app, BrowserWindow, session, ipcMain } from "electron";

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false, // ← prevents the glitch
    icon: path.join(__dirname, "../assets/icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: false,
      webSecurity: false,
    },
  });

  // Maximize before showing → smooth, no flicker
  win.maximize();
  win.show();

  // Load renderer HTML
  win.loadFile(path.join(__dirname, "../renderer/dist/index.html"));

  // Renderer requests a blob download
  ipcMain.on("electron-download", (event, url) => {
    win.webContents.downloadURL(url);
  });

  // Custom Save Dialog filename
  session.defaultSession.on("will-download", (event, item, webContents) => {
    item.setSaveDialogOptions({
      title: "Save PDF",
      defaultPath: "EF - Coupons.pdf",
      filters: [{ name: "PDF File", extensions: ["pdf"] }],
    });

    item.on("updated", () => {
      webContents.send("download-started", "EF - Coupons.pdf");
    });

    item.once("done", (event, state) => {
      if (state === "completed") {
        webContents.send("download-complete", "EF - Coupons.pdf");
      } else {
        webContents.send("download-failed", "EF - Coupons.pdf");
      }
    });
  });
}

app.whenReady().then(createWindow);
