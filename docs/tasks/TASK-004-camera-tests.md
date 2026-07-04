# TASK-004: Camera Store & Component Tests

**Status:** COMPLETED

## Description
Add Vitest test coverage for all camera-related code introduced in TASK-003.  
No camera tests exist yet; the full suite must remain green (≥273 tests).

## Acceptance Criteria
- [x] `src/test/stores/cameraStore.test.ts` — 29 tests covering all store actions
- [x] `src/test/components/cameras/CameraStatusBadge.test.tsx` — 11 tests for all 5 status variants
- [x] `src/test/components/cameras/CameraCard.test.tsx` — 17 tests: rendering, test results, all 4 actions
- [x] `src/test/components/cameras/CameraFormModal.test.tsx` — 18 tests: add/edit mode, submit, cancel, saving state
- [x] All 273 prior tests continue to pass
- [x] Total test count: 348 (75 new tests added)

## Notes
- Mock `@/api/cameras` module in store tests (vi.mock)
- Use `useCameraStore.setState()` to seed state for component tests where appropriate
