# TASK-004 — Authentication UI

## Goal
Wire the existing auth API (`src/api/auth.ts`) into a full authentication flow:
- Login screen rendered when user is unauthenticated
- Auth Zustand store tracking `user`, `loading`, `error`
- Route protection — dashboard inaccessible without a valid session
- TopNavBar shows real user name/role and a Logout button
- On logout the user is redirected back to login

## Acceptance Criteria
- [ ] `src/store/authStore.ts` created with `login`, `logout`, `checkSession` actions
- [ ] `src/components/auth/LoginPage.tsx` created (email + password form, error display)
- [ ] `src/App.tsx` wraps dashboard in auth check; shows `<LoginPage>` when unauthenticated
- [ ] `TopNavBar` reads user from authStore and renders real displayName + role badge
- [ ] Logout button in TopNavBar calls `authStore.logout()`
- [ ] All existing 273 tests still pass
- [ ] At least 10 new tests covering auth store and login page

## Status
🔄 In Progress (Session 2, 2026-05-07)
