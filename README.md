# PDFLab

A fast, in-browser PDF viewer built with React, TypeScript, Vite, and PDF.js. No server required — everything runs locally in the browser.

## Features

### Multi-tab workflow
- Open multiple PDFs at the same time, each in its own tab
- Each tab remembers its own page position and zoom level independently
- Drag tabs left and right to reorder them
- Close any tab with the `×` button; the next tab is focused automatically

### Opening files
- Click the **Open** button in the toolbar (`Ctrl+O`)
- Drag and drop a PDF file anywhere onto the window

### Page navigation
- Scroll continuously through all pages, or lock scroll to one page at a time (toggle in the bottom bar)
- Previous / next page buttons in the bottom bar
- Click any thumbnail in the sidebar to jump directly to that page

### Zoom
| Action | Result |
|---|---|
| `+` / `-` buttons | Step through named zoom levels |
| `Ctrl+Scroll` / trackpad pinch | Live zoom |
| Fit-width button | Fill the viewer width |
| Fit-height button | Fill the viewer height |
| `Ctrl+0` | Reset to 100% |
| Zoom range | 25% – 500% |

### Text selection
- Click and drag over any text in the PDF to select it
- `Ctrl+C` copies the selected text to the clipboard

### Keyboard shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file picker |
| `Ctrl+Scroll` | Zoom in / out |
| `+` / `-` | Zoom in / out |
| `Ctrl+0` | Reset zoom to 100% |
| `← →` / `↑ ↓` | Previous / next page |

### Theming
- Light, dark, or system theme — toggle from the toolbar

---

## Local Development

```bash
npm install
npm run dev
```

## Deployment

The app deploys automatically to **GitHub Pages** on every push to `main` via GitHub Actions.

**One-time setup:** Go to repo Settings → Pages → Source → select **"GitHub Actions"**.

After the first successful workflow run the app is live at:
```
https://ahrhamza.github.io/PDFmanager/
```

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev) — build tool
- [PDF.js v5](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) — PDF rendering and text layer
- [Zustand](https://zustand-demo.pmnd.rs) — state management
- [Tailwind CSS](https://tailwindcss.com) — styling

## Development log

See [`progress.md`](./progress.md) for a session-by-session record of every feature added and bug fixed.
