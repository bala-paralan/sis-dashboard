# TASK-005: Authentication Login Page

## Status: DONE

## Objective
Add a proper authentication flow: a Login page that issues a JWT, stores it, and redirects to the dashboard. Wire the existing `src/api/auth.ts` to the UI.

## Scope

### Files to create
- `src/components/pages/LoginPage.tsx` — login form (username + password, submit, error state)
- `src/store/authStore.ts` — Zustand store holding token, user info, login/logout actions
- `src/test/components/pages/LoginPage.test.tsx`
- `src/test/stores/authStore.test.ts`

### Files to modify
- `src/App.tsx` — wrap routes with auth guard (redirect to /login if unauthenticated)
- `src/api/client.ts` — read token from authStore (already has placeholder logic)

## Acceptance Criteria
- LoginPage renders email + password fields and a submit button
- Failed login shows an error message
- Successful login stores the JWT and redirects to "/"
- Logout clears the token and redirects to "/login"
- All new tests pass
