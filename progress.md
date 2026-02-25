# PDFLab — Development Progress

This file is a running log of every feature, fix, and refactor applied to the project.
New sessions should read this to get up to speed quickly before touching any code.

---

## Session 1 — Project scaffold & core PDF viewer
**Branch:** `claude/build-pdflab-editor-QJrMQ` → merged via PR #1

- Scaffolded the project: React 19 + TypeScript + Vite + Tailwind CSS
- Integrated `pdfjs-dist` v5 for PDF rendering
- `PDFPageRenderer` component renders each page onto a `<canvas>` element
- `MainCanvas` component manages scrolling through all pages of the open document
- `TopBar` with Open button (file picker, PDF only)
- `BottomBar` showing current page / total pages and zoom level
- Basic zoom controls: `+` / `-` buttons and `Ctrl+0` reset
- Keyboard navigation: arrow keys cycle through pages
- Zustand store (`useAppStore`) holding the open document, current page, zoom, and theme
- Light / dark / system theme toggle wired to `prefers-color-scheme`
- GitHub Pages deployment via GitHub Actions (triggers on push to `main`)

---

## Session 2 — Scroll modes, Ctrl+O, and text selection
**Branch:** `claude/build-pdflab-editor-QJrMQ` → merged via PRs #2–4

### Features
- **Scroll mode toggle** (`Continuous` / `Page`) in the bottom bar
  - Continuous: scrolling past a page boundary auto-advances the page counter
  - Page: scroll locked within the current page; page changes only via buttons or keyboard
- **Ctrl+O** intercept — opens the app's own file dialog instead of the browser's default
- **Selectable text layer** — transparent `<div>` rendered over each canvas, positioned using PDF.js `TextLayer`; text can be clicked-and-dragged to select, then copied with Ctrl+C

### Fixes
- `ResizeObserver` no longer silently fails on first load (the `<main>` ref is always mounted)
- Debounced Ctrl+scroll zoom; snap to nearest named zoom step on scroll end

---

## Session 3 — Zoom polish
**Branch:** `claude/build-pdflab-editor-QJrMQ` → merged via PRs #5–6

### Features
- **Fit-to-width** button — calculates the zoom that makes the page fill the viewer width
- **Fit-to-height** button — calculates the zoom that makes the page fill the viewer height
- **Ctrl+scroll to zoom** — intercepts the browser's native page-zoom; smooth trackpad pinch supported
- Unified zoom-step logic in `src/lib/zoom.ts`; `+`/`-` keys snap to the nearest named level rather than stepping blindly

### Fixes
- Sidebar thumbnail fit-to-width was using the wrong container width
- Button hover states were inconsistent between light and dark mode
- Tab filename tooltip was not showing on overflow

---

## Session 4 — Live zoom display, theme hover fix
**Branch:** `claude/build-pdflab-editor-QJrMQ` → merged via PR #7

- Live zoom percentage updates in the bottom bar while Ctrl+scrolling (previously only updated on release)
- Theme toggle button hover state fixed in dark mode

---

## Session 5 — Zoom step refinement
**Branch:** `claude/build-pdflab-editor-QJrMQ` → merged via PR #8 & #9

- Finer zoom steps below 50% (10% increments instead of 25%)
- Fixed a jump that could occur at the mid-range boundary when using Ctrl+scroll
- Consistent high-end zoom steps up to 500%

---

## Session 6 — Multi-tab support, tab close, drag-to-reorder, CI hardening
**Branch:** `claude/multi-tab-thumbnails-5nb0b`

### Features
- **Multi-tab support** — open multiple PDFs simultaneously; each tab is an independent document with its own page position and zoom level
- **Tab close button** — each tab has an `×` button; closing the active tab switches focus to the nearest remaining tab; closing the last tab returns to the empty state
- **Drag-to-reorder tabs** — tabs can be dragged left/right to change their order using the HTML5 drag-and-drop API
- **CI on every push** — GitHub Actions workflow now triggers on all branches (not just `main`) so PRs get a build check
- **Deploy from `claude/**` branches** — the deploy workflow allows deploying from any `claude/*` branch for review

### Fixes
- Tab close button (`×`) was invisible in dark mode (colour contrast issue)
- Drag-and-drop was unreliable — `dragover` handler now calls `preventDefault()` correctly so `drop` fires

---

## Session 7 — Text selection visual polish
**Branch:** `claude/multi-tab-thumbnails-5nb0b`

- Fixed visual artifacts in the PDF text layer during text selection: removed `outline` and `border` rules that were causing bounding-box outlines to appear around individual text spans when selected
- **Known cross-browser difference (not a bug):** Chrome shows per-span selection boxes and Firefox shows heavier blue due to overlapping semi-transparent span backgrounds. This is an inherent limitation of CSS `::selection` on `transform: scaleX()` spans. The correct fix (CSS Highlight API) is deferred.

---

## Architecture notes for new sessions

```
src/
  App.tsx                  — root layout, tab bar, keyboard shortcut wiring
  store/useAppStore.ts     — Zustand store; all global state lives here
  components/
    TopBar.tsx             — toolbar: Open button, zoom controls, theme toggle
    MainCanvas.tsx         — scrollable viewer, mounts one PDFPageRenderer per page
    PDFPageRenderer.tsx    — renders a single page: <canvas> + text layer <div>
    ThumbnailSidebar.tsx   — left panel; renders small canvases for page navigation
    BottomBar.tsx          — status bar: page indicator, zoom %, scroll mode toggle
  hooks/
    useFileDrop.ts         — drag-and-drop file handler (window-level)
  lib/
    pdfjs.ts               — configures the pdfjs-dist worker
    pdfLoader.ts           — loads a File → PDFDocumentProxy
    zoom.ts                — named zoom steps + snap/step helpers
  types/index.ts           — shared TypeScript types (Tab, ScrollMode, Theme, …)
```

**State shape (Zustand store):**
- `tabs: Tab[]` — array of open documents (each has `id`, `filename`, `pdfDoc`, `currentPage`, `zoom`)
- `activeTabId: string | null`
- `theme: 'light' | 'dark' | 'system'`
- `scrollMode: 'continuous' | 'page'`

**PDF rendering pipeline:**
1. User opens a file → `pdfLoader.ts` calls `pdfjsLib.getDocument()` → `PDFDocumentProxy`
2. Proxy stored in Zustand tab; `MainCanvas` iterates pages and mounts `PDFPageRenderer`
3. `PDFPageRenderer` calls `page.render({ canvasContext, viewport })` + `TextLayer.render()` on mount / zoom change
4. `ThumbnailSidebar` runs the same pipeline at a fixed small scale (120 px wide)
