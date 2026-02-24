import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { loadPdfFromFile } from '../lib/pdfLoader'

export function useFileDrop() {
  const addDocument = useAppStore((s) => s.addDocument)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      )
      if (!files.length) return
      setIsLoading(true)
      try {
        for (const file of files) {
          const doc = await loadPdfFromFile(file)
          addDocument(doc)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [addDocument]
  )

  useEffect(() => {
    let enterCount = 0

    function onDragEnter(e: DragEvent) {
      e.preventDefault()
      enterCount++
      setIsDragging(true)
    }
    function onDragLeave() {
      enterCount--
      if (enterCount <= 0) {
        enterCount = 0
        setIsDragging(false)
      }
    }
    function onDragOver(e: DragEvent) {
      e.preventDefault()
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDrop])

  return { isDragging, isLoading }
}
