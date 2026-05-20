# TASK-004: Login / Authentication Page + Protected Routes

## Status: DONE

## Goal
Add a proper authentication layer so the dashboard is accessible only after login.
The auth API (`src/api/auth.ts`) and JWT client already exist; this task wires them
into the UI with a login page and route protection.

## Deliverables
- `src/store/authStore.ts` — Zustand store: user, isAuthenticated, login, logout, checkSession
- `src/components/auth/LoginPage.tsx` — Full-screen login form (email + password)
- `src/components/auth/ProtectedRoute.tsx` — Redirects to /login when not authenticated
- Router wired in `src/main.tsx` using react-router-dom BrowserRouter
- `App.tsx` wrapped in a `<Route path="/" element={<ProtectedRoute />}>` guard
- TopNavBar: user display name + logout button
- Tests: authStore (login/logout/checkSession), LoginPage (render + submit)

## Acceptance Criteria
- Unauthenticated users see LoginPage; authenticated users see dashboard
- Login errors display inline
- Logout clears tokens and redirects to /login
- All existing 273 tests still pass; new tests added
