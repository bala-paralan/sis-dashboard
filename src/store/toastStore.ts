import { create } from 'zustand'
import type { ThreatLevel } from '@/types/sensors'

export interface Toast {
  id:             string
  threatLevel:    ThreatLevel
  classification: string
  timestamp:      string
  location:       string
}

const MAX_TOASTS = 5

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  dismissAll: () => void
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({
      toasts: [{ ...toast, id }, ...s.toasts].slice(0, MAX_TOASTS),
    }))
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  dismissAll: () => set({ toasts: [] }),
}))
