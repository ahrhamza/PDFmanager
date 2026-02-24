# PDFLab

A fast, in-browser PDF viewer and editor built with React, TypeScript, Vite, and PDF.js.

## Implemented Features

### PDF Viewing
- Open PDF files via the **Open** button or drag-and-drop onto the viewer
- Multi-tab support — open multiple PDFs simultaneously with tab switching
- Page-by-page rendering using PDF.js with zoom controls (25% – 500%)

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file picker (PDF only) |
| `+` / `-` | Zoom in / out |
| `Ctrl+0` | Reset zoom to 100% |
| `← →` / `↑ ↓` | Previous / next page |

### Scroll Modes
Toggle between two scroll behaviours from the bottom bar:
- **Continuous** — scrolling past the bottom of a page automatically advances to the next page; scrolling past the top retreats to the previous page
- **Page** — scroll is locked within the current page; page changes only via buttons or keyboard

### UI
- Light / dark / system theme toggle
- Thumbnail sidebar for quick page navigation
- Bottom status bar showing current page, total pages, and zoom level

## Deployment

The app deploys automatically to **GitHub Pages** on every push to `main` via GitHub Actions.

**One-time setup:** Go to repo Settings → Pages → Source → select **"GitHub Actions"**.

After the first successful workflow run the app is live at:
```
https://ahrhamza.github.io/PDFmanager/
```

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev) — build tool
- [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) — PDF rendering
- [pdf-lib](https://pdf-lib.js.org) — PDF manipulation
- [Zustand](https://zustand-demo.pmnd.rs) — state management
- [Tailwind CSS](https://tailwindcss.com) — styling
