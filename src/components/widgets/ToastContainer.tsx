import { useToastStore, type Toast } from '@/store/toastStore'

const TYPE_STYLES: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-green-900/90',  border: 'border-green-500', icon: '✓' },
  error:   { bg: 'bg-red-900/90',    border: 'border-red-500',   icon: '✕' },
  warning: { bg: 'bg-amber-900/90',  border: 'border-amber-500', icon: '⚠' },
  info:    { bg: 'bg-blue-900/90',   border: 'border-blue-500',  icon: 'ℹ' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const styles = TYPE_STYLES[toast.type]

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 px-3 py-2 rounded-md border shadow-lg text-white text-sm min-w-[240px] max-w-[320px] ${styles.bg} ${styles.border}`}
    >
      <span className="font-bold shrink-0">{styles.icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 text-white bg-transparent border-none cursor-pointer text-base leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
