# TASK-004: Unit tests for camera components

**Status:** pending  
**Priority:** high

## Description
Add unit test coverage for the 5 camera components introduced in TASK-003.
These components currently have zero test coverage.

## Scope
- `src/components/cameras/CameraGrid.tsx`
- `src/components/cameras/CameraCard.tsx`
- `src/components/cameras/CameraPlayer.tsx`
- `src/components/cameras/CameraStatusBadge.tsx`
- `src/components/cameras/CameraFormModal.tsx`

## Acceptance Criteria
- [ ] `src/test/components/cameras/CameraStatusBadge.test.tsx` — ≥5 tests
- [ ] `src/test/components/cameras/CameraCard.test.tsx` — ≥8 tests
- [ ] `src/test/components/cameras/CameraFormModal.test.tsx` — ≥8 tests
- [ ] `src/test/components/cameras/CameraGrid.test.tsx` — ≥8 tests
- [ ] `src/test/components/cameras/CameraPlayer.test.tsx` — ≥6 tests
- [ ] All 273 existing tests still pass
- [ ] New tests pass: `npm run test:frontend`
