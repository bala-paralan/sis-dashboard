# TASK-004: Camera Component & Store Test Coverage

## Status: IN PROGRESS

## Goal
Add comprehensive Vitest/Testing Library tests for all camera-related components and the cameraStore, matching the quality bar set in TASK-001 (273 tests, all green).

## Scope
- `src/test/components/cameras/CameraStatusBadge.test.tsx`
- `src/test/components/cameras/CameraCard.test.tsx`
- `src/test/components/cameras/CameraFormModal.test.tsx`
- `src/test/components/cameras/CameraGrid.test.tsx`
- `src/test/stores/cameraStore.test.ts`

## Acceptance Criteria
- [ ] All new tests pass (`npx vitest run`)
- [ ] CameraStatusBadge: renders each status with correct text
- [ ] CameraCard: renders name/location/meta, test result badge, action buttons, delete confirm
- [ ] CameraFormModal: add mode renders empty, edit mode pre-fills, submit calls callback, close button works
- [ ] CameraGrid: shows empty state, renders camera cards, filter controls, pagination when >24
- [ ] cameraStore: loadCameras, addCamera, editCamera, removeCamera, testCamera, selectCamera, filters
