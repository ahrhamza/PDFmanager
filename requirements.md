# Requirements

Everything you need to run PDFLab locally.

## System requirements

| Tool | Minimum | Recommended | Notes |
|---|---|---|---|
| **Node.js** | 18.x | 22.x (LTS) | Tested on v22.22.0 |
| **npm** | 9.x | 10.x | Comes bundled with Node |

No other system dependencies. The app runs entirely in the browser — no backend, no database, no Docker.

## Install Node.js

The easiest way is via a version manager so you can switch Node versions per project.

**macOS / Linux — using `nvm`:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
```

**Windows — using `nvm-windows`:**
Download the installer from https://github.com/coreybutler/nvm-windows/releases, then:
```powershell
nvm install 22
nvm use 22
```

**Direct download:** https://nodejs.org (choose the LTS release)

## Install project dependencies

```bash
npm install
```

This installs everything listed in `package.json` — no extra global packages required.

## Run locally

```bash
npm run dev
```

Opens a Vite dev server at `http://localhost:5173` with hot module replacement.

## Other useful commands

| Command | What it does |
|---|---|
| `npm run build` | Type-checks and builds a production bundle into `dist/` |
| `npm run preview` | Serves the production build locally for a final check |
| `npm run lint` | Runs ESLint across all source files |

## npm packages installed (key ones)

| Package | Version | Purpose |
|---|---|---|
| `pdfjs-dist` | ^5.4.624 | PDF rendering and text layer |
| `react` + `react-dom` | ^19.2.0 | UI framework |
| `zustand` | ^5.0.11 | Global state management |
| `tailwindcss` | ^4.2.1 | Styling (via Vite plugin — no PostCSS config needed) |
| `pdf-lib` | ^1.17.1 | PDF manipulation (reserved for future editing features) |
| `fabric` | ^7.2.0 | Canvas drawing (reserved for future annotation features) |
| `vite` | ^7.3.1 | Dev server and build tool |
| `typescript` | ~5.9.3 | Type checking |
