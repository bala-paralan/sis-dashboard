# TASK-004 — Login / Authentication UI
**Status:** COMPLETED

## Changes
- `src/components/auth/LoginPage.tsx` — login form (email + password, submit, error state)
- `src/components/auth/RequireAuth.tsx` — route guard redirecting to /login if no token
- `src/store/authStore.ts` — Zustand store holding token, user info, login/logout actions
- `src/main.tsx` — BrowserRouter + Routes with auth guard wrapping dashboard
