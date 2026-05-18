# TASK-004 — Login / Authentication UI
**Status:** COMPLETED (Session 1 — 2026-05-18)

## Goal
Add a login screen and route guard so unauthenticated users are redirected to `/login`.

## Acceptance Criteria
- [x] `src/store/authStore.ts` — Zustand store with `user`, `loading`, `error`, `login()`, `logout()`, `init()`
- [x] `src/components/auth/LoginPage.tsx` — email/password form, error display
- [x] `src/components/auth/RequireAuth.tsx` — redirects to `/login` if not authenticated
- [x] `src/main.tsx` updated to wrap app in `<BrowserRouter>`
- [x] `src/App.tsx` updated to use `<Routes>` with protected route
- [x] `vitest run` passes all existing tests
