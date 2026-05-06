# TASK-008 — Auth Tests + Keyboard Panel Shortcuts

**Status:** COMPLETED (Session 1 — 2026-05-06)

## Goal
Two improvements: auth component tests and keyboard shortcuts for panel navigation.

## Acceptance Criteria

### Keyboard Shortcuts
- [x] `useKeyboardShortcuts` hook registered in `App.tsx`
- [x] `Alt+1`…`Alt+9` switches to the 9 main panels in sidebar order
- [x] `?` key opens a `<KeyboardShortcutsModal>` overlay listing all shortcuts
- [x] Modal dismissed by pressing `Escape` or clicking outside
- [x] Shortcuts suppressed when focus is inside `<input>`, `<textarea>`, `<select>`
- [x] `src/test/hooks/useKeyboardShortcuts.test.ts` — 9 tests
- [x] All existing tests continue to pass (377 total)
