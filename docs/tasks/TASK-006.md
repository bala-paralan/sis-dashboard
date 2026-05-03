# TASK-006: Global Keyboard Shortcuts

**Status**: Pending  
**Branch**: `claude/zen-goldberg-FrQX6`

## Goal
Add keyboard navigation shortcuts so operators can switch between panels without using the mouse.

## Scope
- `src/hooks/useKeyboardShortcuts.ts` — register/unregister global `keydown` listener
- Register the following shortcuts:
  - `Alt+M` → activate Map panel
  - `Alt+A` → activate Alerts panel
  - `Alt+V` → activate Video panel
  - `Alt+S` → activate Sensors panel
  - `Alt+I` → activate AI/ML panel
  - `Alt+H` → activate Health panel
  - `Alt+C` → activate Camera Management
  - `Alt+D` → activate Device Config
  - `Escape` → close any expanded panel back to grid
- Mount the hook in `App.tsx`
- Show keyboard shortcut hints in LeftSidebar tooltip on hover
- Test the hook in `src/test/hooks/useKeyboardShortcuts.test.ts`

## Acceptance Criteria
- [ ] Pressing `Alt+M` navigates to map panel (updates `useSystemStore.activePanel`)
- [ ] `Escape` while a panel is expanded collapses it
- [ ] Shortcuts disabled when focus is inside an `<input>` or `<textarea>`
- [ ] Unit tests cover at least 8 shortcut triggers
