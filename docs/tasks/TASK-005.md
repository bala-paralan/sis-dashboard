# TASK-005: Device Config Page Routing & Auth Store Tests

## Status: DONE

## Goal
1. Make `DeviceConfigPage` navigable via React Router at `/device-config`.
2. Add a navigation entry in `LeftSidebar`.
3. Add tests for `useAuthStore`.

## Acceptance Criteria
- [ ] `/device-config` route renders `DeviceConfigPage` (protected — redirect to `/login` if unauthenticated)
- [ ] `LeftSidebar` shows a "Device Config" nav link that sets the active route
- [ ] `useAuthStore.test.ts` covers: initial state, login success, login failure, logout
- [ ] All existing tests continue to pass

## Files to create / modify
- `src/components/layout/LeftSidebar.tsx` — add nav link
- `src/App.tsx` — add `/device-config` route
- `src/test/stores/authStore.test.ts` (new)
