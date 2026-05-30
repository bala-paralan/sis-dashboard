interface Props {
  onClose: () => void
}

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'Alt + 1',   action: 'Focus Live Tactical Map' },
  { keys: 'Alt + 2',   action: 'Focus Alert Management' },
  { keys: 'Alt + 3',   action: 'Focus Video / Imaging' },
  { keys: 'Alt + 4',   action: 'Focus Sensor Families' },
  { keys: 'Alt + 5',   action: 'Focus AI / ML Intelligence' },
  { keys: 'Alt + 6',   action: 'Focus System Health' },
  { keys: 'Alt + S',   action: 'Open / close Settings' },
  { keys: 'Alt + C',   action: 'Open / close Camera Management' },
  { keys: 'Escape',    action: 'Collapse expanded panel back to grid' },
  { keys: '?',         action: 'Show / hide this help modal' },
]

export function ShortcutsHelpModal({ onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: 10,
          padding: '20px 24px 24px',
          minWidth: 340,
          maxWidth: 480,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            ⌨ Keyboard Shortcuts
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: 16,
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            ✕
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <tbody>
            {SHORTCUTS.map(({ keys, action }) => (
              <tr key={keys}>
                <td style={{ padding: '5px 0', paddingRight: 16, whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                  <kbd
                    style={{
                      display: 'inline-block',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--panel-border)',
                      borderRadius: 4,
                      padding: '1px 6px',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: 'var(--accent-blue)',
                    }}
                  >
                    {keys}
                  </kbd>
                </td>
                <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>
                  {action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Shortcuts are disabled when focus is inside a text field.
        </p>
      </div>
    </div>
  )
}
