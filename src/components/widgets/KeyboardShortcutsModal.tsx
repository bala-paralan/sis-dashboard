import { useEffect } from 'react'
import { SHORTCUT_LIST } from '@/hooks/useKeyboardShortcuts'

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
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded border border-white/20 px-2 py-1 text-xs text-gray-400 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <table className="w-full text-sm">
          <tbody>
            {SHORTCUT_LIST.map(({ key, description }) => (
              <tr key={key} className="border-b border-white/5 last:border-0">
                <td className="py-1.5 pr-4">
                  <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-gray-200">
                    {key}
                  </kbd>
                </td>
                <td className="py-1.5 capitalize text-gray-300">{description}</td>
              </tr>
            ))}
            <tr className="border-b border-white/5">
              <td className="py-1.5 pr-4">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-gray-200">?</kbd>
              </td>
              <td className="py-1.5 text-gray-300">Show this help</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-gray-200">Esc</kbd>
              </td>
              <td className="py-1.5 text-gray-300">Close this dialog</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
