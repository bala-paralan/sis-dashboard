# TASK-005: Notification Center

## Status: DONE

## Goal
Replace the single audio beep on new alerts with a proper notification system: toast notifications, sound preferences, and a notification history drawer.

## Requirements
- Toast component (top-right corner) for new CRITICAL/HIGH alerts
- Toast auto-dismiss after 5 s; manual dismiss button
- NotificationCenter drawer (bell icon in TopNavBar) listing recent 50 notifications
- Unread count badge on bell icon
- Sound preference toggle in SettingsPanel (on/off, volume)
- Notification types: Alert, SystemHealth degraded, Connection lost/restored

## Acceptance Criteria
- [x] New CRITICAL or HIGH alert triggers a toast notification
- [x] Toast dismisses after 5 s or on click
- [x] Bell icon shows unread count badge
- [x] Clicking bell opens notification history drawer
- [x] Marking all as read clears badge
- [x] Sound can be toggled off in settings (persists across reload)
- [x] All existing tests still pass
