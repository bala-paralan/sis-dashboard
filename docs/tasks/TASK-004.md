# TASK-004: Camera Component & Store Tests

## Status: DONE

## Summary
TASK-003 added the full camera management UI (CameraGrid, CameraCard, CameraPlayer,
CameraFormModal, CameraStatusBadge) and the cameraStore, but no test coverage was
added for any of these. This task adds comprehensive tests so the camera subsystem
meets the project's 80 % coverage threshold.

## Acceptance Criteria
- [ ] `src/test/stores/cameraStore.test.ts` — unit tests for all store actions
- [ ] `src/test/components/cameras/CameraCard.test.tsx` — render + interaction tests
- [ ] `src/test/components/cameras/CameraStatusBadge.test.tsx` — badge variants
- [ ] `src/test/components/cameras/CameraGrid.test.tsx` — list, filter, pagination
- [ ] `src/test/components/cameras/CameraFormModal.test.tsx` — create/edit/validation
- [ ] `src/test/components/cameras/CameraPlayer.test.tsx` — HLS stream rendering
- [ ] All 273 + new tests pass (`npm run test:frontend`)

## Notes
- Mock `src/api/cameras.ts` (fetchCameras, createCamera, updateCamera, deleteCamera,
  testCamera, startStream, stopStream) using `vi.mock`.
- Mock `hls.js` for CameraPlayer tests.
- Follow the existing test pattern in `src/test/`.
