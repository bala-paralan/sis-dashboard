import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id:        string
  message:   string
  variant:   ToastVariant
  durationMs: number
}

interface ToastState {
  toasts: Toast[]
  addToast:    (message: string, variant?: ToastVariant, durationMs?: number) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

let _counter = 0
const nextId = () => `toast-${++_counter}`

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (message, variant = 'info', durationMs = 4000) => {
    const id = nextId()
    set((s) => ({ toasts: [...s.toasts, { id, message, variant, durationMs }] }))
    return id
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}))
