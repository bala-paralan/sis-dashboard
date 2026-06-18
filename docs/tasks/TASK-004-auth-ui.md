# TASK-004 — Authentication UI

## Goal
Add a login page, auth Zustand store, and protected routing so the
dashboard is only reachable after a successful login.

## Acceptance Criteria
- [ ] `src/store/authStore.ts` — holds `user`, `loading`, `error`; exposes `login()`, `logout()`, `init()`
- [ ] `src/components/pages/LoginPage.tsx` — email/password form; shows validation errors; disables submit while loading
- [ ] `src/App.tsx` — renders `<LoginPage>` when unauthenticated, dashboard when authenticated
- [ ] Auth state is re-hydrated on refresh by calling `getMe()` on mount
- [ ] Logout button wired in `TopNavBar` (or Settings panel)
- [ ] Tests for `authStore` (init, login success/failure, logout)

## Status
DONE
