# TASK-005: Login / Authentication Page

## Status: DONE

## Summary
The project already has a complete auth API (`src/api/auth.ts` — login, logout, getMe)
and JWT token management in `src/api/client.ts`, but there is no login UI. Users land
directly on the dashboard regardless of authentication state. This task adds a proper
login page and guards the dashboard route.

## Acceptance Criteria
- [ ] `src/components/pages/LoginPage.tsx` — email + password form, error display
- [ ] `src/store/authStore.ts` — Zustand store: user, loading, error, login/logout actions
- [ ] `App.tsx` updated — show LoginPage if unauthenticated, dashboard if authenticated
- [ ] `src/test/components/pages/LoginPage.test.tsx` — form render + submit + error tests
- [ ] `src/test/stores/authStore.test.ts` — store action unit tests
- [ ] All existing tests continue to pass

## Design Notes
- Match existing dark-mode CSS variable system (--bg-primary, --accent-blue, etc.)
- Show spinner while login request is in-flight
- On success redirect to dashboard; on failure show inline error message
- "IINVSYS SIS" branding consistent with TopNavBar
