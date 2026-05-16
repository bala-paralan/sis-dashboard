# TASK-007: Global toast notification system

**Status**: DONE  
**Priority**: Medium

## Goal
Show non-intrusive toast notifications whenever a new CRITICAL or HIGH alert
arrives via the WebSocket feed, so operators are aware even when the AlertPanel
is minimised or out of view.

## Acceptance criteria
- [ ] A `ToastContainer` component is mounted once in App.tsx
- [ ] Toasts auto-dismiss after 5 s (CRITICAL) / 3 s (HIGH)
- [ ] Each toast shows: threat level badge, classification, timestamp, location
- [ ] A "Dismiss all" button clears all active toasts
- [ ] Maximum 5 toasts visible simultaneously; older ones are replaced
- [ ] A `useToastStore` (Zustand) manages the toast queue
- [ ] ToastContainer and useToastStore are unit-tested
- [ ] All prior tests remain green
