import { useEffect, useState } from 'react'

interface ActionToastProps {
  message: string
  type?: 'success' | 'error'
  durationMs?: number
  onDone?: () => void
}

export function ActionToast({ message, type = 'success', durationMs = 3000, onDone }: ActionToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, durationMs)
    return () => clearTimeout(t)
  }, [durationMs, onDone])

  if (!visible) return null

  const bg = type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'
  const border = type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'
  const color = type === 'success' ? 'var(--sensor-acoustic)' : 'var(--alert-critical)'
  const icon = type === 'success' ? '✔' : '✖'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[2000] flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  )
}
