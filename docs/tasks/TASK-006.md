# TASK-006: Camera Component Unit Tests

## Status: DONE

## Description
The camera management components added in TASK-003 have no unit tests. Add comprehensive tests for all camera components.

## Goals
- `CameraCard.test.tsx` — renders camera info, calls onEdit/onDelete callbacks
- `CameraStatusBadge.test.tsx` — renders correct badge for each status
- `CameraFormModal.test.tsx` — form validation, submit/cancel behaviour
- `CameraGrid.test.tsx` — renders list, pagination, empty state
- `cameraStore.test.ts` — store actions: addCamera, updateCamera, deleteCamera, setStreaming

## Acceptance Criteria
- [x] All new tests pass
- [x] Coverage for camera components reaches ≥ 80%
- [x] Total test suite remains green
