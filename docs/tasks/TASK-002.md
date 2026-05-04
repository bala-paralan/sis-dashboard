# TASK-002: Login / Auth Gate

**Status:** COMPLETED (Session 3 — 2026-05-04)

## Description
The auth API layer (`src/api/auth.ts`, `src/api/client.ts`) is fully wired but the application renders the dashboard directly with no authentication check. Add a login page and a Zustand auth store so unauthenticated users are gated at the app level.

## Acceptance Criteria
- [x] `src/store/authStore.ts` — Zustand store tracking `user`, `loading`, `error` state; exposes `login()`, `logout()`, `bootstrap()` actions
- [x] `src/components/pages/LoginPage.tsx` — Email + password form; shows loading spinner and inline error; dispatches `authStore.login()`
- [x] `src/App.tsx` updated — bootstraps auth on mount; renders `<LoginPage />` when unauthenticated; renders dashboard when authenticated
- [x] `src/components/layout/TopNavBar.tsx` — logout button visible to authenticated users
- [x] Tests: `src/test/stores/authStore.test.ts` + `src/test/components/pages/LoginPage.test.tsx`
- [x] All 273+ tests remain green

## Notes
Session 3 implementation. TASK-001 and TASK-003 were completed in earlier sessions.
