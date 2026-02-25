import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import PDFPageRenderer from './PDFPageRenderer'
import { nearestStep, snapToNearest } from '../lib/zoom'

export default function MainCanvas() {
  const { documents, activeDocIndex, settings, setZoom, setCurrentPage, setCanvasWidth, setCanvasHeight, setPendingZoom } = useAppStore()
  const doc = documents[activeDocIndex]
  const containerRef = useRef<HTMLDivElement>(null)
  // Prevents rapid page flipping after a page change
  const pageCooldown = useRef(false)
  // Accumulates Ctrl+scroll delta between debounce flushes
  const pendingZoom = useRef<number | null>(null)
  const zoomTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track inner canvas dimensions for fit-to-width/height
  // px-4 = 2×16px horizontal padding; py-6 = 2×24px vertical padding
  // useLayoutEffect fires synchronously after DOM mutations so the first
  // measurement is available before any user interaction (avoids the stale
  // default value of 800 being used if the user clicks fit-to-width quickly).
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setCanvasWidth(el.clientWidth - 32)
      setCanvasHeight(el.clientHeight - 48)
    }
    const obs = new ResizeObserver(update)
    obs.observe(el)
    update() // initial measurement
    return () => obs.disconnect()
  }, [setCanvasWidth, setCanvasHeight])

  // Keyboard shortcuts for zoom and page navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!doc) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setZoom(doc.id, nearestStep(doc.zoom, 1))
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom(doc.id, nearestStep(doc.zoom, -1))
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

  // Ctrl+scroll: zoom in/out, override browser page-zoom.
  // Accumulates deltas into a ref and debounces the actual setZoom call so the
  // PDF only re-renders once after the gesture ends, not on every wheel event.
  useEffect(() => {
    function handleCtrlWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      if (!doc) return
      // deltaY is ~100 per notch on a mouse wheel; trackpad sends smaller values
      const delta = e.deltaY * -0.001
      pendingZoom.current = Math.max(0.25, Math.min(5, (pendingZoom.current ?? doc.zoom) + delta))
      setPendingZoom(pendingZoom.current)
      if (zoomTimer.current) clearTimeout(zoomTimer.current)
      zoomTimer.current = setTimeout(() => {
        if (pendingZoom.current !== null) {
          setZoom(doc.id, snapToNearest(pendingZoom.current))
          pendingZoom.current = null
          setPendingZoom(null)
        }
      }, 250)
    }
    window.addEventListener('wheel', handleCtrlWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleCtrlWheel)
      if (zoomTimer.current) clearTimeout(zoomTimer.current)
      pendingZoom.current = null
    }
  }, [doc, setZoom])

  // Continuous scroll: advance/retreat page when reaching scroll boundary
  useEffect(() => {
    const el = containerRef.current
    if (!el || !doc) return

    function handleWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) return // handled by zoom handler above
      if (settings.scrollMode !== 'continuous') return
      if (pageCooldown.current) return

      const atBottom = el!.scrollTop + el!.clientHeight >= el!.scrollHeight - 2
      const atTop = el!.scrollTop <= 2

      if (e.deltaY > 0 && atBottom && doc!.currentPage < doc!.pageCount - 1) {
        e.preventDefault()
        pageCooldown.current = true
        setCurrentPage(doc!.id, doc!.currentPage + 1)
        requestAnimationFrame(() => { el!.scrollTop = 0 })
        setTimeout(() => { pageCooldown.current = false }, 400)
      } else if (e.deltaY < 0 && atTop && doc!.currentPage > 0) {
        e.preventDefault()
        pageCooldown.current = true
        setCurrentPage(doc!.id, doc!.currentPage - 1)
        requestAnimationFrame(() => { el!.scrollTop = el!.scrollHeight })
        setTimeout(() => { pageCooldown.current = false }, 400)
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [doc, settings.scrollMode, setCurrentPage])

  return (
    <main
      ref={containerRef}
      className={`flex-1 overflow-auto flex flex-col items-center gap-4 ${doc ? 'py-6 px-4' : 'justify-center'}`}
      style={{ backgroundColor: 'var(--app-bg)' }}
      tabIndex={-1}
    >
      {doc ? (
        <PDFPageRenderer
          pdfBytes={doc.pdfBytes}
          pageIndex={doc.currentPage}
          zoom={doc.zoom}
        />
      ) : (
        <EmptyState />
      )}
    </main>
  )
}

function EmptyState() {
  return (
    <>
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
    </>
  )
}
