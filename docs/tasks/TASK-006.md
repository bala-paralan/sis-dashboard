# TASK-006: Authentication UI — Login Page + Route Guards

**Status:** ✅ COMPLETED (Session 3)  
**Commit:** `940bbee feat(TASK-006): authentication UI — login page, auth store, route guards`

## Objective
Add a login page with JWT authentication and route guards to protect the dashboard from unauthenticated access. Wire up the existing `src/api/auth.ts` to a login form.

## Scope
- `src/components/pages/LoginPage.tsx` — email/password form, submit calls `auth.login()`, stores tokens, redirects to dashboard
- `src/store/authStore.ts` — Zustand store: user, isAuthenticated, login(), logout(), initFromStorage()
- Update `src/main.tsx` — wrap app in `<BrowserRouter>`, add `<ProtectedRoute>` wrapper
- `src/components/layout/UserBadge.tsx` — show logged-in user email + logout button in TopNavBar
- `src/test/stores/authStore.test.ts` — login, logout, token persistence tests
- `src/test/components/pages/LoginPage.test.tsx` — form submit, error display, redirect on success

## Acceptance Criteria
- [ ] Unauthenticated users land on /login
- [ ] Successful login redirects to /
- [ ] JWT stored in localStorage, loaded on reload
- [ ] Logout clears tokens and redirects to /login
- [ ] All new tests pass
