# TASK-004: Authentication & Login UI

## Status: DONE

## Description
Implement a full authentication flow with Login page, protected routes, and session management. The `src/api/auth.ts` file exists with API methods but there is no UI or route protection.

## Requirements
- Login page with username/password form, branding (IINVSYS logo/name)
- Protected route wrapper — redirect to `/login` if not authenticated
- JWT/token storage in localStorage
- Logout button in TopNavBar
- Basic error handling (wrong credentials toast)
- Auto-redirect to dashboard after successful login

## Acceptance Criteria
- [ ] `/login` route renders a login form
- [ ] Successful login stores token and redirects to `/`
- [ ] All dashboard routes are behind auth guard
- [ ] Logout clears token and redirects to `/login`
- [ ] Tests pass
