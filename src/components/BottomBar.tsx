import { useAppStore } from '../store/useAppStore'
import { ZOOM_STEPS, nearestStep } from '../lib/zoom'

export default function BottomBar() {
  const { documents, activeDocIndex, settings, canvasWidth, canvasHeight, setScrollMode, setZoom, setCurrentPage } = useAppStore()
  const doc = documents[activeDocIndex]

  if (!doc) {
    return (
      <footer
        className="h-9 shrink-0 border-t flex items-center px-4"
        style={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
      >
        <span className="text-xs app-muted">PDFLab — open a file to get started</span>
      </footer>
    )
  }

  const zoom = doc.zoom

  function zoomIn() { setZoom(doc.id, nearestStep(zoom, 1)) }
  function zoomOut() { setZoom(doc.id, nearestStep(zoom, -1)) }
  function fitToWidth() {
    const zoom = canvasWidth / (doc.naturalWidth || canvasWidth)
    setZoom(doc.id, Math.min(5, zoom))
  }
  function fitToHeight() {
    const zoom = canvasHeight / (doc.naturalHeight || canvasHeight)
    setZoom(doc.id, Math.min(5, zoom))
  }

  function prevPage() {
    if (doc.currentPage > 0) setCurrentPage(doc.id, doc.currentPage - 1)
  }
  function nextPage() {
    if (doc.currentPage < doc.pageCount - 1) setCurrentPage(doc.id, doc.currentPage + 1)
  }

  return (
    <footer
      className="h-9 shrink-0 border-t flex items-center gap-3 px-4"
      style={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
    >
      {/* Page nav */}
      <div className="flex items-center gap-1">
        <BarButton onClick={prevPage} disabled={doc.currentPage === 0} title="Previous page">
          <ChevronLeftIcon />
        </BarButton>
        <span className="text-xs app-muted min-w-[72px] text-center">
          Page {doc.currentPage + 1} of {doc.pageCount}
        </span>
        <BarButton onClick={nextPage} disabled={doc.currentPage >= doc.pageCount - 1} title="Next page">
          <ChevronRightIcon />
        </BarButton>
      </div>

      <Divider />

      {/* Scroll mode toggle */}
      <button
        onClick={() => setScrollMode(settings.scrollMode === 'continuous' ? 'page' : 'continuous')}
        title={settings.scrollMode === 'continuous' ? 'Scroll advances pages (click to lock)' : 'Scroll locked to page (click to enable continuous)'}
        className="flex items-center gap-1 px-2 h-6 rounded text-xs transition-colors border"
        style={{
          backgroundColor: settings.scrollMode === 'continuous' ? 'var(--app-primary)' : 'var(--app-surface-2, #f1f3f5)',
          borderColor: settings.scrollMode === 'continuous' ? 'var(--app-primary)' : 'var(--app-border)',
          color: settings.scrollMode === 'continuous' ? '#fff' : 'var(--app-text-muted, #64748b)',
        }}
      >
        <ScrollIcon />
        <span>{settings.scrollMode === 'continuous' ? 'Continuous' : 'Page'}</span>
      </button>

      <Divider />

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <BarButton onClick={zoomOut} disabled={zoom <= ZOOM_STEPS[0]} title="Zoom out (-)">
          <MinusIcon />
        </BarButton>

        <select
          value={zoom}
          onChange={(e) => setZoom(doc.id, Number(e.target.value))}
          className="text-xs rounded px-1 h-6 border cursor-pointer focus:outline-none"
          style={{
            backgroundColor: 'var(--app-surface-2, #f1f3f5)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-text)',
            minWidth: '60px',
          }}
          title="Zoom level"
        >
          {!ZOOM_STEPS.some((s) => Math.abs(s - zoom) < 0.0001) && (
            <option value={zoom}>{Math.round(zoom * 100)}%</option>
          )}
          {ZOOM_STEPS.map((s) => (
            <option key={s} value={s}>
              {Math.round(s * 100)}%
            </option>
          ))}
        </select>

        <BarButton onClick={zoomIn} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]} title="Zoom in (+)">
          <PlusIcon />
        </BarButton>
        <BarButton onClick={fitToWidth} title="Fit to window width">
          <FitWidthIcon />
        </BarButton>
        <BarButton onClick={fitToHeight} title="Fit to window height">
          <FitHeightIcon />
        </BarButton>
      </div>

      <div className="flex-1" />
    </footer>
  )
}

/* ── Sub-components ──────────────────────────────────────── */
function BarButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-40 border border-transparent hover:border-[var(--app-border)] hover:bg-[var(--app-surface-2,#f1f3f5)]"
      style={{
        color: 'var(--app-text-muted, #64748b)',
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--app-border)' }} />
}

function ChevronLeftIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
}
function ChevronRightIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
}
function MinusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
function FitWidthIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" />
      <path d="M4 12l3-3M4 12l3 3" />
      <path d="M20 12l-3-3M20 12l-3 3" />
    </svg>
  )
}
function FitHeightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16" />
      <path d="M12 4l-3 3M12 4l3 3" />
      <path d="M12 20l-3-3M12 20l3-3" />
    </svg>
  )
}
function ScrollIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="10" x2="12" y2="14"/><polyline points="9 13 12 16 15 13"/></svg>
}
