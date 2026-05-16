import { useEffect } from 'react'
import { useToastStore, type Toast } from '@/store/toastStore'

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'border-red-500/60 bg-red-900/40 text-red-200',
  HIGH:     'border-yellow-500/60 bg-yellow-900/40 text-yellow-200',
}

const DISMISS_DELAY: Record<string, number> = {
  CRITICAL: 5000,
  HIGH:     3000,
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const delay = DISMISS_DELAY[toast.threatLevel] ?? 3000
    const timer = setTimeout(() => onDismiss(toast.id), delay)
    return () => clearTimeout(timer)
  }, [toast.id, toast.threatLevel, onDismiss])

  const colorClass = LEVEL_COLORS[toast.threatLevel] ?? 'border-white/20 bg-gray-800 text-gray-200'

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl transition-all ${colorClass}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold tracking-wide">{toast.threatLevel}</span>
          <span className="text-xs opacity-70">{toast.classification}</span>
        </div>
        <p className="text-xs opacity-80 truncate">{toast.location}</p>
        <p className="text-[10px] opacity-50 mt-0.5">{new Date(toast.timestamp).toLocaleTimeString()}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts      = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)
  const dismissAll   = useToastStore((s) => s.dismissAll)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72"
    >
      {toasts.length > 1 && (
        <button
          onClick={dismissAll}
          className="self-end text-[10px] text-gray-400 hover:text-white transition-colors"
        >
          Dismiss all
        </button>
      )}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
