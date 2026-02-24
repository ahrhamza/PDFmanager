import { useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { loadPdfFromFile } from '../lib/pdfLoader'

export default function TopBar() {
  const { documents, activeDocIndex, settings, setTheme, addDocument, setActiveDocIndex } =
    useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeDoc = documents[activeDocIndex]
  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
  }

  async function handleFileOpen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.pdf')) continue
      const doc = await loadPdfFromFile(file)
      addDocument(doc)
    }
    e.target.value = ''
  }

  return (
    <header
      className="h-12 shrink-0 flex items-center gap-3 px-4 border-b z-10"
      style={{
        backgroundColor: 'var(--app-surface)',
        borderColor: 'var(--app-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <rect width="22" height="22" rx="5" fill="#4f46e5" />
          <path d="M5 6h8M5 10h6M5 14h9M5 18h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-base tracking-tight" style={{ color: 'var(--app-text)' }}>
          PDFLab
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
        {documents.length === 0 ? (
          <span className="text-xs app-muted italic">No files open</span>
        ) : (
          documents.map((doc, i) => (
            <button
              key={doc.id}
              onClick={() => setActiveDocIndex(i)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm whitespace-nowrap shrink-0 transition-colors border"
              style={{
                backgroundColor:
                  i === activeDocIndex ? 'var(--app-primary)' : 'var(--app-surface-2, #f1f3f5)',
                color: i === activeDocIndex ? '#fff' : 'var(--app-text)',
                borderColor: i === activeDocIndex ? 'var(--app-primary)' : 'var(--app-border)',
              }}
            >
              {doc.isDirty && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: i === activeDocIndex ? '#fff' : 'var(--app-primary)' }}
                />
              )}
              <span className="max-w-[140px] truncate">{doc.filename}</span>
            </button>
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Open file */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--app-primary)',
            color: '#fff',
          }}
          title="Open PDF (Ctrl+O)"
        >
          <OpenIcon />
          <span>Open</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileOpen}
        />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-md flex items-center justify-center transition-colors border"
          style={{
            borderColor: 'var(--app-border)',
            backgroundColor: 'var(--app-surface-2, #f1f3f5)',
            color: 'var(--app-text)',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Page info (right side) */}
      {activeDoc && (
        <span className="text-xs app-muted shrink-0">
          {activeDoc.currentPage + 1} / {activeDoc.pageCount}
        </span>
      )}
    </header>
  )
}

/* ── Icon components ─────────────────────────────────────── */
function OpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
