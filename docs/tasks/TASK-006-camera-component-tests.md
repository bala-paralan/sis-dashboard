# TASK-006: Add Tests for Camera Management Components

**Status:** TODO  
**Priority:** Medium

## Description
The camera management UI introduced in TASK-003 has no test coverage.

## Acceptance Criteria
- CameraGrid renders list/grid of cameras, shows pagination, calls store actions
- CameraCard shows name, status badge, action buttons
- CameraStatusBadge renders correct label and colour per status
- CameraFormModal renders form fields for add and edit modes
- CameraPlayer renders container element

## Files to create
- `src/test/components/cameras/CameraGrid.test.tsx`
- `src/test/components/cameras/CameraCard.test.tsx`
- `src/test/components/cameras/CameraStatusBadge.test.tsx`
- `src/test/components/cameras/CameraFormModal.test.tsx`
- `src/test/components/cameras/CameraPlayer.test.tsx`
