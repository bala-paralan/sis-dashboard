# TASK-008 — Auth Tests + Keyboard Panel Shortcuts

## Status: DONE

## Goal
Two improvements that round out session 4 of the dashboard:

### Part A — Auth Component Tests
Write unit/integration tests for the three auth artefacts introduced in TASK-004
that are currently untested: `authStore`, `LoginPage`, `RequireAuth`.

### Part B — Keyboard Shortcuts for Panel Navigation
Add keyboard shortcuts so power users can switch panels without touching the
mouse. Show a `?` help overlay listing all shortcuts.

## Acceptance Criteria

### Auth Tests
- [x] `src/test/stores/authStore.test.ts` — covers `setUser`, `logout`, `hasToken`
- [x] `src/test/components/auth/LoginPage.test.tsx` — renders form, handles submit,
      shows error, loading state
- [x] `src/test/components/auth/RequireAuth.test.tsx` — redirects when no token,
      renders children when token present

### Keyboard Shortcuts
- [x] `useKeyboardShortcuts` hook registered in `App.tsx`
- [x] `Alt+1`…`Alt+9` switches to the 9 main panels in sidebar order
- [x] `?` key opens a `<KeyboardShortcutsModal>` overlay listing all shortcuts
- [x] Modal dismissed by pressing `Escape` or clicking outside
- [x] Shortcuts are suppressed when focus is inside an `<input>`, `<textarea>`,
      or `<select>` element
- [x] `src/test/hooks/useKeyboardShortcuts.test.ts` — at least 6 tests
- [x] All existing 460 tests continue to pass

## Files to create / modify
| File | Action |
|------|--------|
| `src/hooks/useKeyboardShortcuts.ts` | Create |
| `src/components/widgets/KeyboardShortcutsModal.tsx` | Create |
| `src/App.tsx` | Modify — mount hook + modal |
| `src/test/stores/authStore.test.ts` | Create |
| `src/test/components/auth/LoginPage.test.tsx` | Create |
| `src/test/components/auth/RequireAuth.test.tsx` | Create |
| `src/test/hooks/useKeyboardShortcuts.test.ts` | Create |
