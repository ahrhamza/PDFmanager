import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import PDFPageRenderer from './PDFPageRenderer'

export default function MainCanvas() {
  const { documents, activeDocIndex, setZoom, setCurrentPage } = useAppStore()
  const doc = documents[activeDocIndex]
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts for zoom and page navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!doc) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setZoom(doc.id, doc.zoom + 0.1)
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom(doc.id, doc.zoom - 0.1)
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(doc.id, 1)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (doc.currentPage < doc.pageCount - 1)
          setCurrentPage(doc.id, doc.currentPage + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (doc.currentPage > 0) setCurrentPage(doc.id, doc.currentPage - 1)
      }
    },
    [doc, setZoom, setCurrentPage]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!doc) {
    return <EmptyState />
  }

  return (
    <main
      ref={containerRef}
      className="flex-1 overflow-auto flex flex-col items-center py-6 px-4 gap-4"
      style={{ backgroundColor: 'var(--app-bg)' }}
      tabIndex={-1}
    >
      <PDFPageRenderer
        pdfBytes={doc.pdfBytes}
        pageIndex={doc.currentPage}
        zoom={doc.zoom}
      />
    </main>
  )
}

function EmptyState() {
  return (
    <main
      className="flex-1 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--app-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold app-text">Open a PDF to get started</p>
        <p className="text-sm app-muted mt-1">
          Click <strong>Open</strong> in the toolbar or drag a file here
        </p>
      </div>
      <div className="flex flex-col items-center gap-1 mt-2">
        {[
          ['Ctrl+O', 'Open file'],
          ['+/-', 'Zoom in/out'],
          ['Ctrl+0', 'Fit to window'],
          ['← →', 'Navigate pages'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-3 text-xs app-muted">
            <kbd
              className="px-1.5 py-0.5 rounded font-mono text-[10px]"
              style={{
                backgroundColor: 'var(--app-surface-2, #f1f3f5)',
                border: '1px solid var(--app-border)',
                color: 'var(--app-text)',
              }}
            >
              {key}
            </kbd>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
