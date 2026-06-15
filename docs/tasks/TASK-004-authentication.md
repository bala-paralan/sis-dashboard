# TASK-004: Authentication & Login Page

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
Implement a functional login page and wire up the existing auth API so users must authenticate before accessing the dashboard. Show the logged-in operator name in the TopNavBar instead of the hardcoded "Operator" string.

## Acceptance Criteria
- [x] `/login` route renders a login form (email + password)
- [x] On successful login, JWT stored and user redirected to `/` dashboard
- [x] On failed login, an error message is displayed
- [x] TopNavBar shows the actual logged-in username from the auth token
- [x] Unauthenticated visits to `/` redirect to `/login`
- [x] Logout button in TopNavBar calls `/auth/logout` and redirects to `/login`
- [x] All existing tests still pass

## Files Touched
- `src/store/authStore.ts` — new Zustand auth store
- `src/components/pages/LoginPage.tsx` — login form
- `src/components/auth/RequireAuth.tsx` — route guard
- `src/main.tsx` — added BrowserRouter
- `src/App.tsx` — added Routes + RequireAuth
- `src/components/layout/TopNavBar.tsx` — real username + logout button
