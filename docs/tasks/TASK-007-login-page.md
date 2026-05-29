# TASK-007: Add Login / Authentication UI

**Status:** DONE  
**Priority:** Medium

## Description
The app currently assumes users are pre-authenticated. Add a login page and route guard so that unauthenticated users are redirected to `/login`.

## Acceptance Criteria
- `/login` route renders a login form (email + password fields + submit button)
- Successful login calls `auth.login()`, stores the JWT, and navigates to `/`
- Failed login shows an error message below the form
- Route guard in App.tsx redirects to `/login` if no access token in localStorage
- Logout button in TopNavBar clears token and redirects to `/login`
- Tests for LoginPage component

## Files to create / modify
- `src/components/pages/LoginPage.tsx` (new)
- `src/App.tsx` (add router + route guard)
- `src/test/components/pages/LoginPage.test.tsx` (new)

## Notes
Use react-router-dom (already a dependency) for routing.
