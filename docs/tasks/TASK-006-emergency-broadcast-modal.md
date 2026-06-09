# TASK-006: Emergency Broadcast Modal

## Status: DONE

## Problem
The "🚨 Emergency Broadcast" button in `PersonnelPanel.tsx` has no click handler.
In a live border surveillance context this should open a confirmation/compose modal
so the operator can send an emergency message to all personnel.

## Acceptance Criteria
- [ ] Clicking button opens a modal overlay
- [ ] Modal shows a pre-filled broadcast message with severity selector (ROUTINE / URGENT / EMERGENCY)
- [ ] Confirm button closes the modal and shows a toast confirming broadcast sent
- [ ] Cancel button closes without sending
