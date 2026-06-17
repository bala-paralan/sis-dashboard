# TASK-002: Authentication UI

## Status: DONE

## Description
Add a login page and authentication guard to the SIS Dashboard. The backend API already exposes `/auth/login`, `/auth/me`, `/auth/refresh`, and `/auth/logout` endpoints (see `src/api/auth.ts` and `src/api/client.ts`). The frontend currently skips authentication entirely — every visitor sees the full dashboard.

## Goals
- `LoginPage` component: email + password form with error feedback and loading state
- `authStore` (Zustand): manages `user`, `isAuthenticated`, `isChecking`, `login()`, `logout()`, `checkAuth()`
- Auth guard in `App.tsx`: show `LoginPage` when unauthenticated, dashboard when authenticated
- `TopNavBar` update: display real username/role, add logout button
- Unit tests for `authStore` and `LoginPage`

## Acceptance Criteria
- [x] Unauthenticated users see only the login page
- [x] Login with valid credentials loads the dashboard
- [x] Invalid credentials show an inline error message
- [x] Refreshing the page re-validates the stored token (calls `/auth/me`)
- [x] Logout clears tokens and redirects to login
- [x] TopNavBar shows the logged-in user's display name and role
- [x] All existing 273 tests continue to pass (now 348 total)
- [x] New tests cover the auth store and LoginPage component
