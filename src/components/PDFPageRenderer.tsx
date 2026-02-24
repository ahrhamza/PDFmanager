import { useEffect, useRef, useState, useCallback } from 'react'
import { renderPageToCanvas } from '../lib/pdfjs'

interface Props {
  pdfBytes: Uint8Array
  pageIndex: number
  zoom: number
}

export default function PDFPageRenderer({ pdfBytes, pageIndex, zoom }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const renderKey = useRef(0)

  const render = useCallback(async () => {
    const key = ++renderKey.current
    setLoading(true)
    setError(null)
    try {
      const canvas = await renderPageToCanvas(pdfBytes, pageIndex, zoom)
      if (key !== renderKey.current) return // stale render
      const container = containerRef.current
      if (!container) return
      // Replace existing canvas
      const existing = container.querySelector('canvas')
      if (existing) container.removeChild(existing)
      canvas.style.display = 'block'
      canvas.style.maxWidth = '100%'
      container.appendChild(canvas)
    } catch (err) {
      if (key !== renderKey.current) return
      setError(err instanceof Error ? err.message : 'Render failed')
    } finally {
      if (key === renderKey.current) setLoading(false)
    }
  }, [pdfBytes, pageIndex, zoom])

  useEffect(() => {
    render()
  }, [render])

  return (
    <div className="relative flex justify-center">
      {/* Canvas mount point */}
      <div ref={containerRef} className="shadow-lg rounded" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center app-surface rounded">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-primary)] animate-spin"
            />
            <span className="text-sm app-muted">Rendering page…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-red-500 font-medium mb-2">Failed to render page</p>
            <p className="text-sm app-muted">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
