# TASK-005: Login / Auth page

**Status:** DONE

## Description
Add a proper login page that integrates with the existing `src/api/auth.ts` auth flow (JWT, localStorage tokens). Currently `App.tsx` bypasses authentication entirely and jumps straight to the dashboard.

## Acceptance Criteria
- [x] LoginPage component with email + password fields
- [x] Calls `login()` from auth.ts, stores tokens, redirects to dashboard
- [x] Protected route wrapper — unauthenticated users see login page (authStore)
- [x] Logout button in TopNavBar triggers `logout()` and redirects to login
- [x] Form shows validation errors (empty fields, wrong credentials)
- [x] VITE_DEMO_MODE=true bypass for environments without a backend
- [x] All existing tests still pass
