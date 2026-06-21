import { useEffect } from 'react'
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'

interface Props {
  onClose: () => void
}

export function KeyboardShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="bg-bg-secondary border border-border-color rounded-lg p-6 min-w-[320px] max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary font-bold text-base">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer text-lg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 text-[11px] text-text-secondary border-b border-border-color pb-2 mb-1">
            <span className="w-20 font-bold">Shortcut</span>
            <span className="font-bold">Action</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <kbd className="w-20 px-2 py-1 bg-bg-tertiary border border-border-color rounded text-text-primary font-mono text-center shrink-0">Ctrl+K</kbd>
            <span className="text-text-secondary">Open global command search</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <kbd className="w-20 px-2 py-1 bg-bg-tertiary border border-border-color rounded text-text-primary font-mono text-center shrink-0">?</kbd>
            <span className="text-text-secondary">Show this help overlay</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <kbd className="w-20 px-2 py-1 bg-bg-tertiary border border-border-color rounded text-text-primary font-mono text-center shrink-0">Escape</kbd>
            <span className="text-text-secondary">Close overlay / dismiss</span>
          </div>

          <div className="border-t border-border-color pt-2 mt-1">
            <div className="text-[10px] font-bold tracking-widest text-text-secondary uppercase mb-2">Panel Navigation</div>
            {KEYBOARD_SHORTCUTS.map(({ key, panelId }) => (
              <div key={panelId} className="flex items-center gap-4 text-[11px] mb-1.5">
                <kbd className="w-20 px-2 py-1 bg-bg-tertiary border border-border-color rounded text-text-primary font-mono text-center shrink-0">
                  {key}
                </kbd>
                <span className="text-text-secondary capitalize">{panelId.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
