import TopBar from './components/TopBar'
import ThumbnailSidebar from './components/ThumbnailSidebar'
import MainCanvas from './components/MainCanvas'
import BottomBar from './components/BottomBar'
import { useFileDrop } from './hooks/useFileDrop'

export default function App() {
  const { isDragging, isLoading } = useFileDrop()

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Top bar */}
      <TopBar />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <ThumbnailSidebar />
        <MainCanvas />
      </div>

      {/* Bottom bar */}
      <BottomBar />

      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            border: '3px dashed #4f46e5',
          }}
        >
          <div
            className="rounded-2xl px-10 py-8 flex flex-col items-center gap-3 shadow-xl"
            style={{ backgroundColor: 'var(--app-surface)' }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
            <p className="font-semibold text-lg" style={{ color: '#4f46e5' }}>
              Drop PDF to open
            </p>
          </div>
        </div>
      )}

      {/* Global loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        >
          <div
            className="rounded-xl px-8 py-6 flex flex-col items-center gap-3"
            style={{ backgroundColor: 'var(--app-surface)' }}
          >
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{
                borderColor: 'var(--app-border)',
                borderTopColor: '#4f46e5',
              }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--app-text)' }}>
              Loading PDF…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
