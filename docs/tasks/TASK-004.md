# TASK-004: Camera Store & Component Tests

## Status
PENDING → IN_PROGRESS → DONE

## Goal
Add comprehensive Vitest/RTL test coverage for everything introduced in TASK-003
(camera management system). All new tests must pass alongside the existing 273.

## Scope

### Store
- `src/test/stores/cameraStore.test.ts`
  - Initial state shape
  - `addCamera` optimistically prepends camera
  - `editCamera` replaces the matching entry
  - `removeCamera` removes entry and decrements total; clears selectedId if it matches
  - `selectCamera` / deselect
  - `setFilterStatus` / `setFilterSiteId`
  - `startStream` stores hlsUrl keyed by id
  - `stopStream` removes the url entry
  - `loadCameras` sets loading flag, populates cameras on success, sets error on failure
  - `testCamera` stores result in testResults map

### Components
- `src/test/components/cameras/CameraStatusBadge.test.tsx`
  - Renders correct label and colour class for every status value
- `src/test/components/cameras/CameraCard.test.tsx`
  - Renders camera name, status badge, and action buttons
  - Edit button calls onEdit callback
  - Delete button calls onDelete callback
  - Live button calls onLive callback
  - Test button triggers test and shows result

## Acceptance
`npm run test:frontend` → all tests green (≥ 283 tests).
