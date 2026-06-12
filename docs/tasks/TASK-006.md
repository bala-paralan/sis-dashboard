# TASK-006: React Router — Protected Routes & Login Page

## Status: Completed

## Goal
Add React Router v6 routing so unauthenticated users are redirected to `/login`.
Implement a styled Login page that calls the existing `auth.ts` API, stores a minimal
auth state in a new `authStore`, and protects the main dashboard route.

## Scope
- New `src/store/authStore.ts` — holds `{ user, isAuthenticated, login, logout }`
- New `src/components/pages/LoginPage.tsx` — email + password form, calls `auth.login()`
- New `src/components/layout/ProtectedRoute.tsx` — redirects to `/login` when not authenticated
- Update `src/main.tsx` — wrap app in `<BrowserRouter>`
- Update `src/App.tsx` — use `<Routes>` with `/` (protected dashboard) and `/login`

## Acceptance Criteria
- [x] Navigating to `/` when unauthenticated redirects to `/login`
- [x] Successful login navigates to `/` dashboard
- [x] Failed login shows an inline error message
- [x] `authStore` persists auth state to `sessionStorage` (clears on tab close)
- [x] Logout button in TopNavBar calls `auth.logout()` and redirects to `/login`
- [x] Tests cover ProtectedRoute redirect behaviour and authStore actions
- [x] All 273 existing tests still pass (323 tests total now passing)

## Implementation Notes
- `react-router-dom` is already in `dependencies`
- Use `<Navigate to="/login" replace />` for the redirect
- TopNavBar already renders; add a small logout icon/button to the right side
- For the demo environment (no backend), add a bypass: if `VITE_AUTH_BYPASS=true`, mark as authenticated automatically
