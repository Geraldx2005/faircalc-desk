# Eureka Forbes – Coupons Generator

A modern, fast, and production-ready **desktop application** built using:

- **Electron** (desktop runtime)
- **Vite + React** (frontend)
- **Tailwind CSS** (UI styling)
- **React Hot Toast** (notifications)
- **ESBuild** (bundling main + preload scripts)

---

## Features

### Desktop Installer (Windows)
- Generates a `.exe` installer using **electron-builder**
- Includes application icon and metadata
- Smooth installation experience

### Custom PDF Generation
- Fast React interface

### React Hot Toast Notifications
- Clean, modern toast messages.
  
---

## Technologies Used

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

## Folder Structure
Eureka-Forbes-Coupons-Generator/
│
├── build/ # Bundled main.js + preload.cjs (auto-generated)
├── electron/ # Source: main.js + preload.cjs
├── renderer/ # React (Vite) frontend code
│ ├── src/
│ └── dist/ # Vite build output
│
├── assets/ # App icons (.ico + .png)
├── release/ # Final installer (.exe) output
├── package.json
├── README.md
└── .gitignore
