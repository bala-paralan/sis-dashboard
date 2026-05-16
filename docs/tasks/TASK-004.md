# TASK-004: Unit tests for camera management components

**Status**: DONE  
**Priority**: High

## Goal
Add unit tests for all camera management components introduced in TASK-003.
Ensure coverage for CameraStatusBadge, CameraCard, CameraFormModal, CameraGrid,
and the cameraStore Zustand store.

## Acceptance criteria
- [ ] CameraStatusBadge renders correct label and CSS class for all 5 statuses
- [ ] CameraCard displays camera name, location, meta fields, action buttons
- [ ] CameraCard shows test-result badge (reachable / unreachable)
- [ ] CameraFormModal renders in add mode with empty fields
- [ ] CameraFormModal renders in edit mode with pre-filled name, location, manufacturer, model
- [ ] CameraFormModal calls onSubmit with cleaned payload and closes on success
- [ ] CameraFormModal shows error message when onSubmit rejects
- [ ] CameraGrid renders toolbar, empty state, and camera cards
- [ ] cameraStore: loadCameras populates cameras on success; sets error on failure
- [ ] cameraStore: addCamera, editCamera, removeCamera mutate state correctly
- [ ] All 273 + new tests remain green (npm run test:frontend)
