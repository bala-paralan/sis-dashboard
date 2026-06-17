import { SHORTCUT_DESCRIPTIONS } from '@/hooks/useKeyboardShortcuts'

interface ShortcutHelpProps {
  onClose: () => void
}

export function ShortcutHelp({ onClose }: ShortcutHelpProps) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="rounded-xl border min-w-[280px]"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <span
            className="text-[13px] font-bold tracking-[0.04em]"
            style={{ color: 'var(--text-primary)' }}
          >
            Keyboard Shortcuts
          </span>
          <button
            onClick={onClose}
            className="text-[12px] px-2 py-1 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close shortcut help"
          >
            ✕
          </button>
        </div>

        <ul className="px-5 py-4 flex flex-col gap-2.5">
          {SHORTCUT_DESCRIPTIONS.map(({ keys, description }) => (
            <li key={keys} className="flex items-center justify-between gap-8">
              <kbd
                className="text-[11px] font-mono px-1.5 py-0.5 rounded border"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--accent-blue)',
                }}
              >
                {keys}
              </kbd>
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
