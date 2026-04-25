# TASK-004 — Login / Authentication UI

## Status: DONE

## Goal
Add a login page and protect the main dashboard behind authentication.
The `src/api/auth.ts` module already provides `login()`, `logout()`, and `getMe()`
against the `/auth/*` REST endpoints. This task wires up the frontend.

## Acceptance Criteria
- [x] `/login` route renders a login form (email + password)
- [x] Successful login stores tokens (already handled by `auth.ts`) and redirects to `/`
- [x] Failed login shows an inline error message
- [x] `App` is wrapped in a `<RequireAuth>` guard that redirects unauthenticated users to `/login`
- [x] A Zustand `authStore` holds `user: MeResponse | null` and `logout()` action
- [x] The `TopNavBar` shows the logged-in user's email / role and a Logout button
- [x] Logout clears tokens and redirects to `/login`
- [x] All existing 273 tests continue to pass

## Files to create / modify
| File | Action |
|------|--------|
| `src/store/authStore.ts` | Create — Zustand slice for auth state |
| `src/components/auth/LoginPage.tsx` | Create — login form UI |
| `src/components/auth/RequireAuth.tsx` | Create — route guard |
| `src/main.tsx` | Modify — wrap app in `BrowserRouter`, add `/login` route |
| `src/components/layout/TopNavBar.tsx` | Modify — show user info + logout button |
| `src/App.tsx` | Modify — minimal: remove inline router if moved to main |

## Notes
- Use `react-router-dom` (already in `package.json`)
- No real backend in dev; gate the guard on `localStorage` token presence so the UI
  is testable without a running server
- Keep the login form accessible (label/input associations, keyboard submit)
