import { useToastStore } from '@/store/toastStore'
import type { Toast } from '@/store/toastStore'

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-green-900/90 border-green-500/50 text-green-200',
  error:   'bg-red-900/90   border-red-500/50   text-red-200',
  warning: 'bg-amber-900/90 border-amber-500/50 text-amber-200',
  info:    'bg-blue-900/90  border-blue-500/50  text-blue-200',
}

const TYPE_ICONS: Record<string, string> = {
  success: '✓',
  error:   '✗',
  warning: '⚠',
  info:    'ℹ',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg ${TYPE_STYLES[toast.type]}`}
    >
      <span className="shrink-0 font-bold">{TYPE_ICONS[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit text-base leading-none"
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
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
