# TASK-004: User authentication — login page and protected routes

## Status: pending

## Description
Add a login page with username/password form, JWT session management, and route protection so unauthenticated users are redirected to /login. Integrate with the existing API client (src/api/client.ts and src/api/auth.ts).

## Acceptance Criteria
- [ ] `/login` route renders a styled login form matching the dashboard theme
- [ ] Successful login stores JWT token and redirects to dashboard
- [ ] Failed login shows an error message
- [ ] All dashboard routes redirect to /login when no valid token exists
- [ ] Logout button in TopNavBar clears the session
- [ ] Tests for the login form and auth flow

## Depends on
TASK-002
