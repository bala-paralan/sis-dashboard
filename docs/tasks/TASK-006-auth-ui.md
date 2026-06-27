# TASK-006: Authentication UI (Login Page)

**Status:** pending  
**Priority:** medium

## Description

The auth API (`src/api/auth.ts`) is fully defined with login/logout/getMe but there is no login page UI. The app currently loads directly without any authentication gate.

## Work Items

- [ ] Create `src/components/pages/LoginPage.tsx` — email/password form, error handling, loading state
- [ ] Add `authStore` (Zustand) to track current user, auth status, login/logout actions
- [ ] Wrap `App.tsx` with an auth gate — redirect unauthenticated users to LoginPage
- [ ] Add logout button to TopNavBar for authenticated users
- [ ] Add `src/test/components/pages/LoginPage.test.tsx`
- [ ] Add `src/test/stores/authStore.test.ts`

## Acceptance Criteria

- Unauthenticated users see the login form
- Valid credentials store JWT and show the dashboard
- Invalid credentials show an error message
- Logout clears tokens and returns to login
- Role (ADMIN/OPERATOR/VIEWER) stored in authStore for future RBAC use
