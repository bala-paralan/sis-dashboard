import { useEffect } from 'react'
import { useToastStore } from '@/store/toastStore'
import type { Toast } from '@/store/toastStore'

const TYPE_STYLES: Record<Toast['type'], string> = {
  success: 'border-green-500/40  bg-green-900/80  text-green-200',
  error:   'border-red-500/40    bg-red-900/80    text-red-200',
  warning: 'border-yellow-500/40 bg-yellow-900/80 text-yellow-200',
  info:    'border-blue-500/40   bg-blue-900/80   text-blue-200',
}

const ICON: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✗',
  warning: '⚠',
  info:    'ℹ',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, removeToast])

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg transition-all duration-300 ${TYPE_STYLES[toast.type]}`}
    >
      <span className="mt-px shrink-0 font-bold">{ICON[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss"
        className="ml-1 shrink-0 opacity-60 hover:opacity-100"
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
      className="fixed right-4 top-4 z-[9999] flex w-80 flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
