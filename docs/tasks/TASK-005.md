# TASK-005: API Client & Auth Tests

## Status
PENDING → IN_PROGRESS → DONE

## Goal
Add unit tests for the three new API modules introduced in TASK-003.
Mock `fetch` globally so tests are offline-safe.

## Scope

### `src/test/api/client.test.ts`
- `apiFetch` attaches Authorization header when token exists in localStorage
- `apiFetch` throws on non-2xx response
- `apiFetch` refreshes token on 401 and retries request
- `apiFetch` propagates JSON body correctly for POST requests

### `src/test/api/auth.test.ts`
- `getToken` / `setToken` / `clearToken` round-trip localStorage correctly
- `refreshToken` calls the correct endpoint and updates stored token

### `src/test/api/cameras.test.ts`
- `fetchCameras` builds correct query string for all filter combinations
- `createCamera` sends POST with JSON body
- `updateCamera` sends PUT with correct path and body
- `deleteCamera` sends DELETE to correct path
- `testCamera` sends POST to `/cameras/:id/test`
- `startStream` / `stopStream` hit correct stream endpoints

## Acceptance
`npm run test:frontend` → all tests green (≥ 303 tests).
