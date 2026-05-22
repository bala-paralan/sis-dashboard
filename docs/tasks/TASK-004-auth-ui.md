# TASK-004: Authentication UI

## Status: DONE

## Goal
Add a login page and protect all dashboard routes behind authentication. The app currently assumes the user is already authenticated (JWT stored in localStorage) but has no UI for logging in or logging out.

## Requirements
- Login page (`/login`) with email + password form
- Protected route wrapper — redirect unauthenticated users to `/login`
- On successful login, redirect to dashboard (`/`)
- Logout button in TopNavBar that calls `api/auth.logout()` and redirects to `/login`
- Show current user info (name/role) in TopNavBar
- Handle API errors (invalid credentials, network failure)
- Persist auth state across page refresh via localStorage tokens

## Acceptance Criteria
- [x] `/login` page renders with email + password fields and submit button
- [x] Invalid credentials show an inline error message
- [x] Successful login navigates to dashboard
- [x] Unauthenticated access to any route redirects to `/login`
- [x] TopNavBar shows logged-in user name and role badge
- [x] Logout clears tokens and redirects to `/login`
- [x] All existing tests still pass
