import { useEffect } from 'react'
import { useToastStore } from '@/store/toastStore'
import type { Toast } from '@/store/toastStore'

const VARIANT_CLASSES: Record<Toast['variant'], string> = {
  success: 'bg-green-700  border-green-500  text-green-100',
  error:   'bg-red-800    border-red-500    text-red-100',
  warning: 'bg-yellow-700 border-yellow-500 text-yellow-100',
  info:    'bg-blue-800   border-blue-500   text-blue-100',
}

const ICONS: Record<Toast['variant'], string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.durationMs)
    return () => clearTimeout(timer)
  }, [toast.id, toast.durationMs, removeToast])

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={`toast-${toast.id}`}
      className={`flex items-start gap-2 min-w-[260px] max-w-sm px-4 py-3 rounded border text-sm shadow-lg ${VARIANT_CLASSES[toast.variant]}`}
    >
      <span aria-hidden="true" className="mt-0.5 font-bold">{ICONS[toast.variant]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        aria-label="Dismiss notification"
        onClick={() => removeToast(toast.id)}
        className="ml-2 opacity-70 hover:opacity-100 leading-none"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
