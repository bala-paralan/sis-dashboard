import { useEffect } from 'react'

interface ActionToastProps {
  message: string
  type?: 'success' | 'error'
  visible: boolean
  onDismiss: () => void
}

export function ActionToast({ message, type = 'success', visible, onDismiss }: ActionToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  const isError = type === 'error'
  return (
    <div
      className="fixed bottom-4 right-4 z-[300] px-4 py-2 rounded-lg text-[11px] font-semibold shadow-lg flex items-center gap-2"
      style={{
        background: isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
        color: isError ? 'var(--alert-critical)' : 'var(--sensor-acoustic)',
      }}
      data-testid="action-toast"
      role="status"
    >
      <span>{isError ? '✕' : '✓'}</span>
      {message}
    </div>
  )
}
