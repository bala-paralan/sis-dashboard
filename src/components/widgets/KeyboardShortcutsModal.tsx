import { useEffect } from 'react'

interface KeyboardShortcutsModalProps {
  onClose: () => void
}

const SHORTCUTS = [
  { keys: 'Alt+1', desc: 'Live Tactical Map' },
  { keys: 'Alt+2', desc: 'Alert Management' },
  { keys: 'Alt+3', desc: 'Video / Imaging' },
  { keys: 'Alt+4', desc: 'Sensor Families' },
  { keys: 'Alt+5', desc: 'AI / ML Intelligence' },
  { keys: 'Alt+6', desc: 'System Health' },
  { keys: 'Alt+7', desc: 'Counter-UAS' },
  { keys: 'Alt+8', desc: 'Personnel & NavIC' },
  { keys: 'Alt+9', desc: 'Power & Vehicle Health' },
  { keys: '?',     desc: 'Show this help overlay' },
  { keys: 'Esc',   desc: 'Close this overlay' },
]

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl border p-6 w-full max-w-sm shadow-2xl"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold text-text-primary">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            aria-label="Close shortcuts help"
            className="w-6 h-6 rounded flex items-center justify-center text-text-secondary cursor-pointer border-none"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {SHORTCUTS.map(({ keys, desc }) => (
            <div
              key={keys}
              className="flex items-center justify-between py-1.5 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <span className="text-[12px] text-text-secondary">{desc}</span>
              <kbd
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-blue)',
                }}
              >
                {keys}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-text-muted text-center mt-4">
          Shortcuts are disabled when a text input is focused.
        </p>
      </div>
    </div>
  )
}
