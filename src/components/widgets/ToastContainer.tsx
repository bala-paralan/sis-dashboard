import { useEffect } from 'react'
import { useToastStore, type Toast } from '@/store/toastStore'

const TYPE_STYLES: Record<Toast['type'], string> = {
  success: 'bg-green-900/90 border-green-500/50 text-green-200',
  error:   'bg-red-900/90   border-red-500/50   text-red-200',
  warning: 'bg-amber-900/90 border-amber-500/50 text-amber-200',
  info:    'bg-blue-900/90  border-blue-500/50  text-blue-200',
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, remove])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm ${TYPE_STYLES[toast.type]}`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2"
      style={{ width: '20rem' }}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
