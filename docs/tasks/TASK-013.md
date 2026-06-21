# TASK-013 — Global Command Search (Ctrl+K)

**Status:** COMPLETED

## Goal
Add a global command-palette search dialog (Ctrl+K) that lets operators quickly navigate to any panel, find recent unacknowledged alerts, or locate cameras without leaving the keyboard.

## Requirements
- `SearchModal` component: modal overlay with text input, grouped results, arrow-key navigation
- Search across: panels (all defined panels), recent unacked alerts (description/family/level), cameras (name/site/location)
- `Ctrl+K` shortcut registered via a `useEffect` in `App.tsx`
- `?` shortcut modal updated to document `Ctrl+K`
- Results grouped by category (Panels, Alerts, Cameras) with section headers
- Arrow-key navigation across groups; Enter selects; Escape closes
- Selecting a panel → `setActivePanel(id)`, alert → navigate to Alerts panel, camera → navigate to Cameras panel
- Empty query shows "Quick Navigation" with first 6 panels for instant access

## Changes
- `src/components/widgets/SearchModal.tsx` — new component
- `src/App.tsx` — mount `<SearchModal>` + Ctrl+K handler
- `src/components/widgets/KeyboardShortcutsModal.tsx` — add Ctrl+K row
- `src/test/components/widgets/SearchModal.test.tsx` — 10 tests

## Acceptance Criteria
- [x] Ctrl+K opens the search modal
- [x] Empty query shows Quick Navigation (6 panels)
- [x] Typing filters panels, alerts, cameras
- [x] Arrow keys move selection; Enter navigates; Escape closes
- [x] Clicking backdrop closes modal
- [x] Keyboard shortcuts help shows Ctrl+K entry
- [x] All existing 435 tests still pass; 10 new tests added
