# TASK-007: Role-Based Access Control (RBAC) Enforcement

## Status: DONE

## Goal
Enforce role-based UI restrictions. User roles (ADMIN, OPERATOR, VIEWER) are already stored but not used to gate any UI actions.

## Requirements
- VIEWER: read-only; hide acknowledge buttons, hide camera CRUD, hide command actions, hide settings changes
- OPERATOR: full operational access; can ack alerts, control cameras, run commands; cannot change system settings
- ADMIN: full access including settings, device config, user management placeholder

## Implementation
- `useRole()` hook that reads role from auth store
- `<RequiresRole role="OPERATOR">` wrapper component (renders null if insufficient role)
- Apply to: Alert ack buttons, Camera add/edit/delete, CommandPanel actions, SettingsPanel save, DeviceConfigPage

## Acceptance Criteria
- [x] VIEWER cannot see acknowledge buttons on alerts
- [x] VIEWER cannot see Add/Edit/Delete camera buttons
- [x] OPERATOR can ack alerts and manage cameras
- [x] ADMIN has full access
- [x] Role indicator shows in TopNavBar
- [x] All existing tests still pass
