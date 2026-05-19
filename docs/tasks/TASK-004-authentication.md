# TASK-004: Authentication & Login Page

## Status: DONE (Session 1)

## Goal
Implement a functional login page and wire up the existing auth API so users must authenticate before accessing the dashboard. Show the logged-in operator name in the TopNavBar instead of the hardcoded "Operator" string.

## Acceptance Criteria
- [x] `/login` route renders a login form (email + password)
- [x] On successful login, JWT stored and user redirected to `/` dashboard
- [x] On failed login, an error message is displayed
- [x] TopNavBar shows the actual logged-in username from the auth token
- [x] Unauthenticated visits to `/` redirect to `/login`
- [x] Logout button in TopNavBar calls `/auth/logout` and redirects to `/login`
- [x] All existing tests still pass (287 total, 9 new LoginPage tests)

## Files to Touch
- `src/App.tsx` — add router + auth guard
- `src/main.tsx` — wrap with BrowserRouter
- `src/api/auth.ts` — already defined, just wire up
- `src/store/systemStore.ts` — add `user` field and `setUser` action
- `src/components/layout/TopNavBar.tsx` — show real username, add logout
- `src/components/pages/LoginPage.tsx` — new file
- `src/test/components/pages/LoginPage.test.tsx` — new tests
