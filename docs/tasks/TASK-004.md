# TASK-004: Authentication UI — Login Page & Route Guards

## Status: DONE

## Description
The auth API layer (`src/api/auth.ts`) is complete with login/logout/getMe endpoints, but there is no login UI or route protection. The app currently loads directly into the dashboard with no authentication check.

## Requirements
1. Create `src/components/auth/LoginPage.tsx` — centered card with email/password form, submit button with loading spinner, error message display
2. Create `src/store/authStore.ts` — Zustand store tracking: `user` (MeResponse | null), `loading`, `error`; actions: `login`, `logout`, `checkSession`
3. Wrap the app in a route guard — unauthenticated users see LoginPage, authenticated users see the dashboard
4. Call `getMe()` on app mount to restore session from stored token
5. Wire logout to the TopNavBar (user avatar / dropdown)
6. Handle token expiry gracefully (redirect to login, clear store)

## Acceptance Criteria
- [x] Login page renders with email + password fields
- [x] Submitting valid credentials stores token and shows dashboard
- [x] Invalid credentials shows error message below form
- [x] Refreshing while logged in keeps user on dashboard (token persists)
- [x] Clicking logout clears token and redirects to login
- [x] All existing tests continue to pass (273/273)
