# TASK-007: Wire Up Action Buttons with WebSocket Commands

## Status: In Progress

## Goal
Implement the `onClick` handlers for the stub action buttons in CounterUASPanel and
PersonnelPanel. Each button sends a typed WebSocket command via `useSystemStore.sendMessage()`
and shows a brief visual confirmation. Destructive actions (Engage QRT) require a
confirmation modal.

## Scope
- `src/components/panels/CounterUASPanel.tsx`:
  - "Notify QRT" → send `{ type: 'QRT_NOTIFY', payload: { contact_id, threat_level } }`
  - "Engage QRT" → confirmation modal → send `{ type: 'QRT_ENGAGE', payload: { contact_id } }`
  - "Log Engagement" → send `{ type: 'ENGAGEMENT_LOG', payload: { contact_id, timestamp } }`
- `src/components/panels/PersonnelPanel.tsx`:
  - "Emergency Broadcast" → confirmation modal → send `{ type: 'EMERGENCY_BROADCAST', payload: { message, timestamp } }`
- New `src/components/widgets/ConfirmModal.tsx` — reusable confirmation dialog
- New `src/components/widgets/ActionToast.tsx` — brief success/error toast notification

## Acceptance Criteria
- [ ] All 4 buttons have working `onClick` handlers
- [ ] "Engage QRT" and "Emergency Broadcast" show a confirmation modal before sending
- [ ] A toast notification appears for 3 seconds after each action
- [ ] `sendMessage` is called with the correct message structure
- [ ] Tests cover ConfirmModal open/close/confirm flow
- [ ] All 273 existing tests still pass

## Implementation Notes
- Use `useSystemStore(s => s.sendMessage)` to access the WebSocket send function
- The toast can use a simple `useState` + `useEffect` with a 3000ms timeout
- Modal: trap focus, ESC key closes, backdrop click closes
