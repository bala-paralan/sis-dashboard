# TASK-009: API layer tests

## Scope
Write unit tests for the API client and auth/camera modules.

## Files to test
- `src/api/client.ts` — apiFetch, token storage helpers
- `src/api/auth.ts` — login, logout, getMe
- `src/api/cameras.ts` — fetchCameras, createCamera, updateCamera, deleteCamera, testCamera, startStream, stopStream

## Test files
- `src/test/api/client.test.ts`
- `src/test/api/auth.test.ts`
- `src/test/api/cameras.test.ts`

## Acceptance criteria
- Token storage: storeTokens, clearTokens, getAccessToken, getRefreshToken work correctly
- apiFetch: attaches Authorization header when token present
- apiFetch: retries with refreshed token on 401
- apiFetch: throws on non-OK responses
- apiFetch: returns undefined on 204
- login: calls /auth/login then /auth/me, stores tokens
- logout: calls /auth/logout (if refresh token), then clears tokens
- getMe: calls /auth/me
- fetchCameras: builds correct query string
- createCamera: POSTs with body
- updateCamera: PUTs with body
- deleteCamera: sends DELETE
- testCamera: POSTs to /cameras/:id/test
- startStream/stopStream: correct methods/paths
