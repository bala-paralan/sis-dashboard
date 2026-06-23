import { useEffect, useRef } from 'react'
import { useToastStore, type Toast } from '@/store/toastStore'

const ICONS: Record<Toast['variant'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const COLORS: Record<Toast['variant'], { bg: string; border: string; text: string }> = {
  success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.4)', text: '#10B981' },
  error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.4)',  text: '#EF4444' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.4)', text: '#F59E0B' },
  info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.4)', text: '#3B82F6' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => dismiss(toast.id), 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, dismiss])

  const { bg, border, text } = COLORS[toast.variant]

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={() => dismiss(toast.id)}
      className="flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer shadow-lg transition-all"
      style={{ background: bg, borderColor: border, minWidth: 240, maxWidth: 360 }}
    >
      <span className="font-bold shrink-0 mt-px" style={{ color: text }}>{ICONS[toast.variant]}</span>
      <span className="text-text-primary leading-snug">{toast.message}</span>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
