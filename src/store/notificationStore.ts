import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'ALERT' | 'SYSTEM_HEALTH' | 'CONNECTION'
  title: string
  message: string
  timestamp: string
  read: boolean
  threatLevel?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  drawerOpen: boolean
  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void
  markAllRead: () => void
  dismissNotification: (id: string) => void
  setDrawerOpen: (open: boolean) => void
}

let _idCounter = 0

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  drawerOpen: false,

  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: `notif-${++_idCounter}-${Date.now()}`,
      read: false,
    }
    set((s) => {
      const notifications = [notification, ...s.notifications].slice(0, 50)
      return { notifications, unreadCount: s.unreadCount + 1 }
    })
  },

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  dismissNotification: (id) =>
    set((s) => {
      const notif = s.notifications.find((n) => n.id === id)
      return {
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      }
    }),

  setDrawerOpen: (open) => {
    set({ drawerOpen: open })
    if (open) get().markAllRead()
  },
}))
