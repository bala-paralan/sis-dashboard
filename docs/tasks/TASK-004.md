# TASK-004: Camera Component & Store Tests

**Status:** COMPLETED (Session 3 — 2026-05-04)

## Description
TASK-003 shipped with zero unit tests for the camera subsystem. Add comprehensive tests covering the camera Zustand store and each camera UI component.

## Acceptance Criteria
- [x] `src/test/stores/cameraStore.test.ts` — tests for all store actions (loadCameras, addCamera, editCamera, removeCamera, testCamera, selectCamera, startStream, stopStream, filters)
- [x] `src/test/components/cameras/CameraCard.test.tsx` — renders metadata, status badge, action buttons; confirms delete confirm dialog
- [x] `src/test/components/cameras/CameraFormModal.test.tsx` — add mode vs edit mode pre-fill; form submission; error display
- [x] `src/test/components/cameras/CameraStatusBadge.test.tsx` — all five status variants render correct label + colour class
- [x] `src/test/components/cameras/CameraGrid.test.tsx` — loading skeleton, empty state, grid render, filter interactions
- [x] All new tests green; total test count ≥ 353 (up from 273)

## Notes
Completed in Session 3 alongside TASK-002.
