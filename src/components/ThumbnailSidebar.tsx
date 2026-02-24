import { useAppStore } from '../store/useAppStore'

export default function ThumbnailSidebar() {
  const { documents, activeDocIndex, setCurrentPage } = useAppStore()
  const doc = documents[activeDocIndex]

  if (!doc) {
    return (
      <aside
        className="w-44 shrink-0 border-r flex flex-col items-center pt-8 gap-2"
        style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-surface)' }}
      >
        <p className="text-xs app-muted text-center px-3">No PDF open</p>
      </aside>
    )
  }

  return (
    <aside
      className="w-44 shrink-0 border-r overflow-y-auto flex flex-col gap-2 py-3 px-2"
      style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-surface)' }}
    >
      {doc.thumbnails.map((thumb, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(doc.id, i)}
          className="flex flex-col items-center gap-1 p-1 rounded-md cursor-pointer border transition-colors focus:outline-none"
          style={{
            borderColor: doc.currentPage === i ? 'var(--app-primary)' : 'transparent',
            backgroundColor: doc.currentPage === i ? 'var(--app-surface-2, #f1f3f5)' : 'transparent',
          }}
        >
          <img
            src={thumb.dataUrl}
            alt={`Page ${i + 1}`}
            className="w-full rounded shadow-sm"
            style={{ aspectRatio: `${thumb.width}/${thumb.height}` }}
          />
          <span className="text-[10px] app-muted">{i + 1}</span>
        </button>
      ))}
    </aside>
  )
}
