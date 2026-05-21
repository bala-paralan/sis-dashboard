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
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100 text-sm"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
              <tr key={key}>
                <td className="py-1.5 pr-4 font-mono font-semibold" style={{ color: 'var(--accent-primary)' }}>
                  {key}
                </td>
                <td className="py-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
