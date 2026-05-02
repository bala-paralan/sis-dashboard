import { useEffect } from 'react'
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'

interface Props {
  onClose: () => void
}

export function KeyboardShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer bg-transparent border-none text-lg leading-none"
            aria-label="Close shortcuts modal"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--text-secondary)]">{description}</span>
              <kbd className="rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2 py-0.5 font-mono text-xs text-[var(--text-primary)]">
                {key}
              </kbd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 text-sm mt-1 border-t border-[var(--border-color)] pt-2">
            <span className="text-[var(--text-secondary)]">Show this help</span>
            <kbd className="rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2 py-0.5 font-mono text-xs text-[var(--text-primary)]">?</kbd>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">Close this modal</span>
            <kbd className="rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2 py-0.5 font-mono text-xs text-[var(--text-primary)]">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}
