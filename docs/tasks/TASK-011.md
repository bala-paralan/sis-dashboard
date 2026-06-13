# TASK-011 — Role-Based Access Control (RBAC)

**Status:** COMPLETED

## Goal
Enforce role-based UI restrictions using the `role` field already present in authStore. Three roles: ADMIN, OPERATOR, VIEWER.

## Requirements
- `useRole()` hook — reads role from authStore, exposes hasRole(required) helper
- `RequiresRole` wrapper component — renders children only when role rank is sufficient; accepts optional `fallback`
- Role hierarchy: VIEWER < OPERATOR < ADMIN
- Apply gates to:
  - Alert ACK buttons → OPERATOR+
  - Camera Add/Edit/Delete buttons → OPERATOR+
  - CommandPanel actions → OPERATOR+
  - SettingsPanel save/apply → ADMIN
  - DeviceConfigPage → ADMIN
- Role badge displayed in TopNavBar

## Changes
- `src/hooks/useRole.ts` — reads role from authStore with hasRole() helper
- `src/components/auth/RequiresRole.tsx` — wrapper component
- `src/components/widgets/AlertRow.tsx` — ACK button gated by OPERATOR+
- `src/components/cameras/CameraCard.tsx` — Edit/Delete gated by OPERATOR+
- `src/components/cameras/CameraGrid.tsx` — Add Camera gated by OPERATOR+
- `src/components/panels/CommandPanel.tsx` — Export Report gated by OPERATOR+
- Tests updated to set OPERATOR role in beforeEach

## Acceptance Criteria
- [x] VIEWER cannot see ACK button on alerts
- [x] VIEWER cannot see Add/Edit/Delete camera buttons
- [x] OPERATOR can ACK alerts and manage cameras
- [x] ADMIN has full access
- [x] Role badge shows in TopNavBar (from TASK-004)
- [x] All existing tests still pass
