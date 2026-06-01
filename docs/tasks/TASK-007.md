# TASK-007: Authentication / Login Page

## Status: COMPLETED

## Goal
Add a login page and route-based auth guard so unauthenticated users are
redirected to /login. Use the existing auth API (src/api/auth.ts).

## Scope
- `src/components/pages/LoginPage.tsx` — email/password form
- `src/components/layout/AuthGuard.tsx` — route wrapper
- `src/store/authStore.ts` — token + user state
- Update `src/main.tsx` to use React Router + AuthGuard
- `src/test/components/pages/LoginPage.test.tsx`
- `src/test/components/layout/AuthGuard.test.tsx`
- `src/test/stores/authStore.test.ts`

## Acceptance Criteria
- [ ] /login renders form; successful submit navigates to /
- [ ] Unauthenticated routes redirect to /login
- [ ] Token stored in localStorage, cleared on logout
- [ ] All new tests pass
