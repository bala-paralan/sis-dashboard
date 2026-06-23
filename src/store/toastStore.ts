import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
}

interface ToastState {
  toasts: Toast[]
  show: (message: string, variant?: Toast['variant']) => void
  dismiss: (id: string) => void
}

let nextId = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  show: (message, variant = 'info') => {
    const id = String(++nextId)
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

/** Convenience helpers — call from anywhere without the hook. */
export const toast = {
  success: (msg: string) => useToastStore.getState().show(msg, 'success'),
  error:   (msg: string) => useToastStore.getState().show(msg, 'error'),
  warning: (msg: string) => useToastStore.getState().show(msg, 'warning'),
  info:    (msg: string) => useToastStore.getState().show(msg, 'info'),
}
