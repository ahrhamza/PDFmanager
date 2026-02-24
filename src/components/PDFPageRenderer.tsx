import { useEffect, useRef, useState, useCallback } from 'react'
import { loadPdfPage, pdfjsLib } from '../lib/pdfjs'

interface Props {
  pdfBytes: Uint8Array
  pageIndex: number
  zoom: number
}

export default function PDFPageRenderer({ pdfBytes, pageIndex, zoom }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const renderKey = useRef(0)

  const render = useCallback(async () => {
    const key = ++renderKey.current
    setLoading(true)
    setError(null)

    let pdf: Awaited<ReturnType<typeof loadPdfPage>>['pdf'] | null = null
    try {
      const loaded = await loadPdfPage(pdfBytes, pageIndex, zoom)
      pdf = loaded.pdf
      const { page, viewport } = loaded

      if (key !== renderKey.current) return

      // --- Canvas ---
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.display = 'block'

      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, canvas, viewport }).promise

      if (key !== renderKey.current) return

      const wrapper = wrapperRef.current
      if (!wrapper) return

      // Swap in new canvas
      const oldCanvas = wrapper.querySelector('canvas')
      if (oldCanvas) wrapper.removeChild(oldCanvas)
      wrapper.insertBefore(canvas, wrapper.firstChild)

      // --- Text layer ---
      const textLayerEl = textLayerRef.current
      if (textLayerEl) {
        textLayerEl.replaceChildren()
        pdfjsLib.setLayerDimensions(textLayerEl, viewport)
        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: page.streamTextContent(),
          container: textLayerEl,
          viewport,
        })
        await textLayer.render()
      }
    } catch (err) {
      if (key !== renderKey.current) return
      setError(err instanceof Error ? err.message : 'Render failed')
    } finally {
      pdf?.destroy()
      if (key === renderKey.current) setLoading(false)
    }
  }, [pdfBytes, pageIndex, zoom])

  useEffect(() => {
    render()
  }, [render])

  return (
    <div className="relative flex justify-center">
      {/* Canvas + text layer wrapper */}
      <div
        ref={wrapperRef}
        className="shadow-lg rounded"
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {/* Canvas is imperatively appended here */}
        <div ref={textLayerRef} className="textLayer" />
      </div>

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
