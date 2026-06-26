import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'sis-operator-notes'
const MAX_CHARS = 2000

export function OperatorNotes() {
  const [text, setText] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? '' } catch { return '' }
  })
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text)
        const now = new Date()
        const hms = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
        setLastSaved(hms)
      } catch { /* quota exceeded */ }
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [text])

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    setText('')
    setLastSaved(null)
    setConfirmClear(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }

  const remaining = MAX_CHARS - text.length

  return (
    <div className="px-3 py-2 border-t border-border-color" style={{ flexShrink: 0 }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold tracking-[0.08em] text-text-secondary uppercase">
          Operator Notes
        </span>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[10px] text-text-muted">Saved {lastSaved}</span>
          )}
          <span className={`text-[10px] ${remaining < 100 ? 'text-alert-medium' : 'text-text-muted'}`}>
            {remaining}/{MAX_CHARS}
          </span>
          <button
            onClick={handleClear}
            title={confirmClear ? 'Click again to confirm clear' : 'Clear notes'}
            style={{
              fontSize: '10px',
              color: confirmClear ? 'var(--alert-critical)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '1px 4px',
            }}
          >
            {confirmClear ? 'Confirm?' : '✕ Clear'}
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setText(e.target.value)
            setConfirmClear(false)
          }
        }}
        placeholder="Type shift notes, observations, reminders..."
        rows={3}
        style={{
          width: '100%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '11px',
          padding: '7px 9px',
          resize: 'vertical',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          outline: 'none',
          lineHeight: '1.5',
        }}
      />
    </div>
  )
}
