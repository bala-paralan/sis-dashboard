# TASK-007: Authentication / Login Page with React Router

**Status:** ⏳ PENDING

## Description
Add a proper login page using the existing `src/api/auth.ts` module. Wire up React Router so unauthenticated users are redirected to `/login` and authenticated users reach the main dashboard at `/`.

## Acceptance Criteria
- [ ] `LoginPage` component with username/password form, validation, loading state, error message
- [ ] React Router v6 routes: `/` → App (protected), `/login` → LoginPage
- [ ] `PrivateRoute` HOC checks auth token and redirects to `/login` if absent
- [ ] Token stored in localStorage (or sessionStorage) on successful login
- [ ] Logout action in TopNavBar clears token and redirects
- [ ] Unit tests: LoginPage renders, submit calls auth API, redirects on success, shows error on failure
- [ ] All tests pass

## Estimated LOC
~280 lines (component + route config + tests)
