# TASK-004: Camera Store & Component Unit Tests

## Status: DONE

## Summary
TASK-003 added the camera management UI (CameraGrid, CameraCard, CameraPlayer, CameraFormModal, CameraStatusBadge, useCameraStore) but shipped with zero tests. This task adds comprehensive unit tests for all camera-related code.

## Scope
- `src/test/store/cameraStore.test.ts` — all store actions (load, add, edit, remove, test, selectCamera, startStream, stopStream, filters)
- `src/test/components/cameras/CameraCard.test.tsx` — render, status badge color, button callbacks
- `src/test/components/cameras/CameraStatusBadge.test.tsx` — all 5 status variants
- `src/test/components/cameras/CameraFormModal.test.tsx` — add mode, edit mode, validation, submit/close
- `src/test/components/cameras/CameraGrid.test.tsx` — grid renders, filter controls, pagination, empty state, loading skeleton

## Acceptance Criteria
- All new tests pass with `npx vitest run`
- Total test count increases by ≥ 35 tests
- No new TypeScript errors (`npx tsc --noEmit`)
