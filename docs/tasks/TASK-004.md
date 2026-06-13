# TASK-004 — Login / Authentication UI
**Status:** COMPLETED

## Changes
- `src/components/auth/LoginPage.tsx` — email/password login form
- `src/components/auth/RequireAuth.tsx` — route guard; redirects to /login when no token
- `src/store/authStore.ts` — user state, setUser, logout, hasToken
- `src/main.tsx` — BrowserRouter + /login route
- `src/components/layout/TopNavBar.tsx` — user info + logout button
