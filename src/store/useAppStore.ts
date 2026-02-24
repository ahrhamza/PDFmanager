import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { OpenDocument, ClipboardPage, AppSettings, Tool } from '../types'

interface AppState {
  // ── Documents ──────────────────────────────────────────────
  documents: OpenDocument[]
  activeDocIndex: number

  // ── Clipboard ──────────────────────────────────────────────
  clipboard: ClipboardPage[] | null

  // ── Active tool ────────────────────────────────────────────
  activeTool: Tool

  // ── Settings ───────────────────────────────────────────────
  settings: AppSettings

  // ── Recently closed (last 5) ───────────────────────────────
  recentlyClosed: { filename: string; pdfBytes: Uint8Array }[]

  // ── Actions ────────────────────────────────────────────────
  addDocument: (doc: OpenDocument) => void
  removeDocument: (id: string) => void
  setActiveDocIndex: (index: number) => void
  updateDocument: (id: string, patch: Partial<OpenDocument>) => void
  setClipboard: (pages: ClipboardPage[] | null) => void
  setActiveTool: (tool: Tool) => void
  setTheme: (theme: AppSettings['theme']) => void
  setScrollMode: (mode: AppSettings['scrollMode']) => void
  setZoom: (docId: string, zoom: number) => void
  setCurrentPage: (docId: string, page: number) => void
}

function resolvedTheme(setting: AppSettings['theme']): 'light' | 'dark' {
  if (setting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return setting
}

function applyTheme(setting: AppSettings['theme']) {
  const theme = resolvedTheme(setting)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

// Detect initial theme from localStorage or system preference
function getInitialTheme(): AppSettings['theme'] {
  const stored = localStorage.getItem('pdflab-theme') as AppSettings['theme'] | null
  return stored ?? 'system'
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    documents: [],
    activeDocIndex: 0,
    clipboard: null,
    activeTool: 'select',
    recentlyClosed: [],
    settings: {
      theme: getInitialTheme(),
      defaultZoom: 1,
      scrollMode: 'continuous',
    },

    addDocument: (doc) =>
      set((s) => ({
        documents: [...s.documents, doc],
        activeDocIndex: s.documents.length,
      })),

    removeDocument: (id) =>
      set((s) => {
        const idx = s.documents.findIndex((d) => d.id === id)
        if (idx === -1) return s
        const removed = s.documents[idx]
        const docs = s.documents.filter((d) => d.id !== id)
        const recentlyClosed = [
          { filename: removed.filename, pdfBytes: removed.pdfBytes },
          ...s.recentlyClosed,
        ].slice(0, 5)
        const newActive = Math.min(s.activeDocIndex, Math.max(0, docs.length - 1))
        return { documents: docs, activeDocIndex: newActive, recentlyClosed }
      }),

    setActiveDocIndex: (index) => set({ activeDocIndex: index }),

    updateDocument: (id, patch) =>
      set((s) => ({
        documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      })),

    setClipboard: (pages) => set({ clipboard: pages }),

    setActiveTool: (tool) => set({ activeTool: tool }),

    setTheme: (theme) => {
      localStorage.setItem('pdflab-theme', theme)
      applyTheme(theme)
      set((s) => ({ settings: { ...s.settings, theme } }))
    },

    setScrollMode: (scrollMode) =>
      set((s) => ({ settings: { ...s.settings, scrollMode } })),

    setZoom: (docId, zoom) =>
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === docId ? { ...d, zoom: Math.max(0.25, Math.min(5, zoom)) } : d
        ),
      })),

    setCurrentPage: (docId, page) =>
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === docId ? { ...d, currentPage: page } : d
        ),
      })),
  }))
)

// Apply theme on store init
applyTheme(useAppStore.getState().settings.theme)
