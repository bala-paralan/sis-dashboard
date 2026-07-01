# TASK-007: Login/Auth UI page

## Status: pending

## Summary
Add a login screen and route guard. The auth API (src/api/auth.ts) is already wired up.

## Requirements
- `LoginPage` component with email + password form
- On submit: call `login()` from api/auth.ts
- On success: navigate to the dashboard
- On error: display error message
- Route guard: if no access token in localStorage, redirect to /login
- Logout button in TopNavBar calls `logout()` and redirects to /login

## Acceptance criteria
- LoginPage renders without errors
- Form submits and shows error on failure
- Authenticated users see the dashboard; unauthenticated users see /login
- Tests for LoginPage (mock api/auth)
