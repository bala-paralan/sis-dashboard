import { SHORTCUT_DESCRIPTIONS, SHORTCUT_PANELS } from '@/hooks/useKeyboardShortcuts'

interface Props {
  onClose: () => void
}

export function KeyboardShortcutLegend({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard shortcuts"
      >
        <h2 className="mb-4 text-base font-semibold text-white">Keyboard Shortcuts</h2>

        <table className="w-full text-sm">
          <tbody>
            {SHORTCUT_DESCRIPTIONS.map(({ keys, description }) => (
              <tr key={keys} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-4">
                  <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs text-gray-300">
                    {keys}
                  </kbd>
                </td>
                <td className="py-2 text-gray-400">{description}</td>
              </tr>
            ))}
            {SHORTCUT_PANELS.map((id, i) => (
              <tr key={id} className="border-b border-white/5 last:border-0">
                <td className="py-1.5 pr-4">
                  <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs text-gray-300">
                    Alt+{i + 1}
                  </kbd>
                </td>
                <td className="py-1.5 capitalize text-gray-500">{id} panel</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded border border-white/20 py-1.5 text-sm text-gray-400 hover:bg-white/10"
        >
          Close
        </button>
      </div>
    </div>
  )
}
