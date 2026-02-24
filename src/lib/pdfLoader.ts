import { PDFDocument } from 'pdf-lib'
import { renderThumbnail } from './pdfjs'
import type { OpenDocument, PageThumbnail } from '../types'

let idCounter = 0
function generateId(): string {
  return `doc-${Date.now()}-${++idCounter}`
}

export async function loadPdfFromBytes(
  bytes: Uint8Array,
  filename: string
): Promise<OpenDocument> {
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: false })
  const pageCount = pdfDoc.getPageCount()

  // Generate thumbnails for all pages
  const thumbnails: PageThumbnail[] = await Promise.all(
    Array.from({ length: pageCount }, async (_, i) => {
      const { dataUrl, width, height } = await renderThumbnail(bytes, i)
      return { pageIndex: i, dataUrl, width, height }
    })
  )

  const naturalWidth = pdfDoc.getPage(0).getSize().width

  return {
    id: generateId(),
    filename,
    pdfBytes: bytes,
    pdfDoc,
    pageCount,
    thumbnails,
    annotations: [],
    currentPage: 0,
    zoom: 1,
    naturalWidth,
    scrollTop: 0,
    undoStack: [],
    redoStack: [],
    isDirty: false,
  }
}

export async function loadPdfFromFile(file: File): Promise<OpenDocument> {
  const arrayBuffer = await file.arrayBuffer()
  return loadPdfFromBytes(new Uint8Array(arrayBuffer), file.name)
}
