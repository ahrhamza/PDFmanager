import * as pdfjsLib from 'pdfjs-dist'

// Point PDF.js at its worker — Vite serves it from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href

export { pdfjsLib }

/**
 * Load a PDF page and return the page object, viewport, and owning PDFDocumentProxy.
 * Caller is responsible for calling pdf.destroy() when done.
 */
export async function loadPdfPage(pdfBytes: Uint8Array, pageIndex: number, scale: number) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(pageIndex + 1) // PDF.js is 1-indexed
  const viewport = page.getViewport({ scale })
  return { pdf, page, viewport }
}

/** Render a page at low resolution for thumbnail use */
export async function renderThumbnail(
  pdfBytes: Uint8Array,
  pageIndex: number,
  maxWidth = 160
): Promise<{ dataUrl: string; width: number; height: number }> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(pageIndex + 1)

  const vp = page.getViewport({ scale: 1 })
  const scale = maxWidth / vp.width
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, canvas, viewport }).promise
  pdf.destroy()

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.75),
    width: canvas.width,
    height: canvas.height,
  }
}
