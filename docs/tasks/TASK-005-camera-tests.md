# TASK-005 — Camera Component Tests

## Goal
Add Vitest/RTL test coverage for every camera component introduced in
TASK-003 so the suite reaches ≥90 % line coverage on `src/components/cameras/`.

## Acceptance Criteria
- [ ] `CameraCard.test.tsx` — renders name/status/location; calls onEdit, onDelete, onTest, onSelect
- [ ] `CameraStatusBadge.test.tsx` — renders correct colour/label for each status
- [ ] `CameraFormModal.test.tsx` — renders add / edit forms; submit calls handler; cancel closes
- [ ] `CameraGrid.test.tsx` — renders card list; filter bar changes displayed cameras
- [ ] `CameraPlayer.test.tsx` — renders HLS player placeholder; stop button calls handler
- [ ] `cameraStore.test.ts` — loadCameras, addCamera, editCamera, removeCamera, testCamera, selectCamera
- [ ] All existing 273 tests still pass

## Status
DONE
