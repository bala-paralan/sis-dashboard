# TASK-006: Store & API Test Coverage

## Status: COMPLETED

## Goal
Add tests for the remaining stores and API modules that currently lack test files.

## Scope
- `src/test/stores/settingsStore.test.ts`
- `src/test/stores/viewStore.test.ts`
- `src/test/api/cameras.test.ts`
- `src/test/api/auth.test.ts`
- `src/test/api/client.test.ts`

## Acceptance Criteria
- [ ] settingsStore: panel visibility toggles, reset, theme persistence
- [ ] viewStore: active view state
- [ ] api/cameras: fetchCameras, createCamera, updateCamera, deleteCamera, testCamera, startStream, stopStream — all with mocked fetch
- [ ] api/auth: login/logout, token handling
- [ ] api/client: apiFetch helper — success, error, 401 handling
