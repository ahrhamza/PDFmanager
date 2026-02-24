import type { PDFDocument } from 'pdf-lib'

export interface PageThumbnail {
  pageIndex: number
  dataUrl: string
  width: number
  height: number
}

export interface AnnotationLayer {
  pageIndex: number
  fabricJson: string // serialised Fabric.js canvas JSON
}

export interface UndoEntry {
  label: string
  /** serialised PDF bytes before this action */
  pdfBytes: Uint8Array
  /** serialised Fabric annotation layers before this action */
  annotations: AnnotationLayer[]
}

export interface OpenDocument {
  id: string
  filename: string
  /** raw PDF bytes (kept in sync on every mutation) */
  pdfBytes: Uint8Array
  /** PDF-lib document instance */
  pdfDoc: PDFDocument
  pageCount: number
  thumbnails: PageThumbnail[]
  annotations: AnnotationLayer[]
  /** currently selected page (0-indexed) */
  currentPage: number
  zoom: number
  scrollTop: number
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]
  isDirty: boolean
}

export interface ClipboardPage {
  sourceDocId: string
  pageIndex: number
  /** base64-encoded single-page PDF */
  pageBytes: string
  thumbnailDataUrl: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  defaultZoom: number
}

export type Tool =
  | 'select'
  | 'text'
  | 'draw'
  | 'highlight'
  | 'rect'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'sticky'
  | 'redact'
  | 'image'
