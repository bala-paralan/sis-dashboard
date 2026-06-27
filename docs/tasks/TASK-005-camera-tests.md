# TASK-005: Camera Store & Component Tests

**Status:** completed (partial — store + CameraCard + CameraStatusBadge tests added; CameraGrid/CameraFormModal/CameraPlayer deferred to TASK-005b)  
**Priority:** high

## Description

The cameraStore and all 5 camera components (CameraGrid, CameraCard, CameraPlayer, CameraFormModal, CameraStatusBadge) have zero test coverage.

## Work Items

- [ ] `src/test/stores/cameraStore.test.ts` — CRUD actions, filter, pagination, stream control
- [ ] `src/test/components/cameras/CameraGrid.test.tsx` — render, filter, add/edit/delete flows
- [ ] `src/test/components/cameras/CameraCard.test.tsx` — status, timestamps, actions
- [ ] `src/test/components/cameras/CameraFormModal.test.tsx` — form validation, submit
- [ ] `src/test/components/cameras/CameraStatusBadge.test.tsx` — all statuses
- [ ] `src/test/components/cameras/CameraPlayer.test.tsx` — HLS player, placeholder fallback

## Acceptance Criteria

- cameraStore has full action coverage
- Camera components tested for render + interactions
- API calls properly mocked
- All 273 existing tests continue to pass
