# TASK-004: Tests for camera components and cameraStore

## Status: pending

## Summary
Add comprehensive unit tests for all camera-related code introduced in TASK-003.

## Files to test
- `src/components/cameras/CameraCard.tsx`
- `src/components/cameras/CameraStatusBadge.tsx`
- `src/components/cameras/CameraGrid.tsx`
- `src/components/cameras/CameraFormModal.tsx`
- `src/components/cameras/CameraPlayer.tsx`
- `src/store/cameraStore.ts`

## Acceptance criteria
- All camera components have render + interaction tests
- cameraStore CRUD operations are tested with mocked API calls
- All tests pass (`npm run test:frontend`)
