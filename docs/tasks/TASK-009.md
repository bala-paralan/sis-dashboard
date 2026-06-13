# TASK-009 — Notification Center

**Status:** COMPLETED

## Goal
Add a persistent notification drawer with a bell icon in the TopNavBar, unread badge, and store that collects up to 50 notifications from alerts, system health, and connection events.

## Requirements
- `notificationStore` — queue (max 50), unread count, drawerOpen flag, addNotification / markAllRead / dismiss
- `NotificationCenter` drawer component (right panel, slides in from nav)
- Bell icon in TopNavBar with unread badge count
- New CRITICAL/HIGH alerts automatically push notifications via alertStore watcher
- Mark all read on drawer open

## Acceptance Criteria
- [x] Bell icon in TopNavBar shows unread count badge
- [x] Clicking bell opens notification drawer
- [x] Drawer lists notifications newest-first with type icon, title, message, time
- [x] Mark all read clears unread badge
- [x] New CRITICAL/HIGH alerts automatically appear as notifications
- [x] Max 50 notifications (oldest discarded)
- [x] All existing tests still pass

## Changes
- `src/store/notificationStore.ts` — new store
- `src/components/widgets/NotificationCenter.tsx` — drawer component
- `src/components/layout/TopNavBar.tsx` — bell icon + badge
- `src/App.tsx` — mount NotificationCenter + alert watcher
