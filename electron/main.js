import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Preload path:", path.join(__dirname, "../electron/preload.cjs"));

import { app, BrowserWindow, session, ipcMain } from "electron";

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: path.join(__dirname, "../assets/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: false, // ← MUST ADD (Production)
      webSecurity: false, // ← ALLOWS SAVE DIALOG (Production)
    },
  });

  // Renderer triggers a download (blob URL)
  ipcMain.on("electron-download", (event, url) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.downloadURL(url);
    }
  });

  // Load renderer build
  win.loadFile(path.join(__dirname, "../renderer/dist/index.html"));

  // Handle download and apply custom filename to Save dialog
  session.defaultSession.on("will-download", (event, item, webContents) => {
    // Change ONLY the default filename in Save dialog
    item.setSaveDialogOptions({
      title: "Save PDF",
      defaultPath: "ER - Coupons.pdf",
      filters: [{ name: "PDF File", extensions: ["pdf"] }],
    });

    // Notify renderer
    item.on("updated", () => {
      webContents.send("download-started", "ER - Coupons.pdf");
    });

    item.once("done", (event, state) => {
      if (state === "completed") {
        webContents.send("download-complete", "ER - Coupons.pdf");
      } else {
        webContents.send("download-failed", "ER - Coupons.pdf");
      }
    });
  });
}

app.whenReady().then(createWindow);
