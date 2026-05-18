import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

interface ToastState {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

let nextId = 1

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  add: (toast) => {
    const id = String(nextId++)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
  },

  remove: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
