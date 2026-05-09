import { SHORTCUT_DEFINITIONS } from '@/hooks/useKeyboardShortcuts'

interface Props {
  onClose: () => void
}

export function KeyboardShortcutsOverlay({ onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-xl border shadow-2xl min-w-[320px]"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="text-[13px] font-bold text-text-primary">
            Keyboard Shortcuts
          </span>
          <button
            onClick={onClose}
            aria-label="Close shortcuts overlay"
            className="text-text-secondary cursor-pointer bg-transparent border-none text-[16px] leading-none"
          >
            ✕
          </button>
        </div>

        {/* Shortcut table */}
        <div className="px-5 py-3">
          {SHORTCUT_DEFINITIONS.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center gap-4 py-[5px] border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <kbd
                className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded text-[11px] font-mono font-bold shrink-0"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-blue)',
                }}
              >
                {key}
              </kbd>
              <span className="text-[11px] text-text-secondary">{description}</span>
            </div>
          ))}
        </div>

        <div
          className="px-5 py-2 text-[10px] text-text-secondary border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          Shortcuts are disabled while an input field has focus.
        </div>
      </div>
    </div>
  )
}
