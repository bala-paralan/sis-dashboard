import { useEffect, useRef } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
      data-testid="confirm-modal-backdrop"
    >
      <div
        className="bg-bg-secondary border border-border-color rounded-lg shadow-xl p-5 max-w-[320px] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div
          id="confirm-modal-title"
          className="text-[13px] font-bold text-text-primary mb-2"
        >
          {title}
        </div>
        <div className="text-[11px] text-text-secondary mb-4 leading-relaxed">
          {message}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-bg-tertiary border border-border-color rounded text-text-secondary cursor-pointer text-[11px]"
            data-testid="confirm-modal-cancel"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="px-3 py-1.5 bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.5)] rounded text-alert-critical cursor-pointer text-[11px] font-semibold"
            data-testid="confirm-modal-confirm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
