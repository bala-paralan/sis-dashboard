import { create } from 'zustand'
import type { ThreatLevel } from '@/types/sensors'

export interface Notification {
  id: string
  type: 'ALERT' | 'SYSTEM' | 'CONNECTION'
  title: string
  message: string
  timestamp: string
  read: boolean
  threatLevel?: ThreatLevel
}

const MAX_NOTIFICATIONS = 50

function loadSoundPref(): boolean {
  try {
    return localStorage.getItem('sis-sound') !== 'false'
  } catch {
    return true
  }
}

interface NotificationState {
  notifications: Notification[]
  centerOpen: boolean
  soundEnabled: boolean

  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void
  markAllRead: () => void
  dismissNotification: (id: string) => void
  setCenterOpen: (open: boolean) => void
  toggleCenter: () => void
  toggleSound: () => void

  unreadCount: () => number
  toastQueue: () => Notification[]
}

let _nextId = 1

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  centerOpen: false,
  soundEnabled: loadSoundPref(),

  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: String(_nextId++),
      read: false,
    }
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, MAX_NOTIFICATIONS),
    }))
  },

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  dismissNotification: (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }))
  },

  setCenterOpen: (open) => set({ centerOpen: open }),

  toggleCenter: () => {
    const { centerOpen } = get()
    if (!centerOpen) {
      // Mark all read when opening
      set((s) => ({
        centerOpen: true,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }))
    } else {
      set({ centerOpen: false })
    }
  },

  toggleSound: () => {
    const enabled = !get().soundEnabled
    try { localStorage.setItem('sis-sound', String(enabled)) } catch { /* noop */ }
    set({ soundEnabled: enabled })
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  toastQueue: () =>
    get()
      .notifications.filter((n) => !n.read && (n.threatLevel === 'CRITICAL' || n.threatLevel === 'HIGH' || n.type === 'CONNECTION'))
      .slice(0, 3),
}))
