# Eureka Forbes – Coupons Generator

A modern, fast, and production-ready **desktop application** built using:

- **Electron** (desktop runtime)
- **Vite + React** (frontend)
- **Tailwind CSS** (UI styling)
- **React Hot Toast** (notifications)
- **ESBuild** (bundling main + preload scripts)

This app allows Eureka Forbes staff or distributors to quickly **generate discount coupons as PDFs**, customize the output, and download them using a clean and stable Electron interface.

---

## 🚀 Features

### ✔ Desktop Installer (Windows)
- Generates a `.exe` installer using **electron-builder**
- Includes application icon and metadata
- Smooth installation experience

### ✔ Custom PDF Generation
- Fast React interface
- Generates PDF coupons with your custom data
- Supported in both dev & production builds

### ✔ Electron Download Handling
- Custom filename: **ER - Coupons.pdf**
- Save dialog appears on download
- No random filenames
- Fully functional `will-download` handler
- Smooth notifications (`Downloading…`, `Complete!`, etc.)

### ✔ React Hot Toast Notifications
- Clean, modern toast messages for:
  - Download started
  - Download completed
  - Download failed

### ✔ Preload Script (IPC Bridge)
- Secure communication between frontend and Electron
- Properly handled with `preload.cjs`

### ✔ Production-Ready Build Setup
- ESBuild for main/preload bundling
- Vite for frontend bundling
- `release/` output folder for .exe builds
- `.gitignore` excludes build artifacts

---

## 🛠 Technologies Used

| Layer | Tech |
|-------|------|
| Desktop Runtime | Electron |
| Frontend UI | React + Vite |
| Styling | Tailwind CSS |
| Notifications | React Hot Toast |
| Bundler | ESBuild |
| Packaging | electron-builder |
| Language | JavaScript (ESM + CJS) |

---

## 📦 Folder Structure

