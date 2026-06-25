# TASK-002: Authentication Flow & React Router

## Status: DONE

## Goal
Add a login page, an auth Zustand store, React Router protected routes, and user display with logout in the TopNavBar. The auth API (`src/api/auth.ts`) and `react-router-dom` are already installed but not wired up.

## Acceptance Criteria
- [ ] `useAuthStore` (Zustand) tracks `user`, `loading`, `error`; exposes `login()` and `logout()`
- [ ] `LoginPage` renders an email/password form; on success navigates to `/`
- [ ] React Router wraps the app; unauthenticated visitors are redirected to `/login`
- [ ] Authenticated user's `displayName` / `email` and role badge shown in `TopNavBar`
- [ ] Logout button in `TopNavBar` calls `logout()` and redirects to `/login`
- [ ] All existing 273 tests continue to pass

## Files to create / modify
- `src/store/authStore.ts` (new)
- `src/components/pages/LoginPage.tsx` (new)
- `src/main.tsx` — wrap with `<BrowserRouter>`
- `src/App.tsx` — add route guard
- `src/components/layout/TopNavBar.tsx` — user chip + logout
