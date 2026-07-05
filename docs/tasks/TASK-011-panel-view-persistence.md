# TASK-011: Persist Panel View State Across Sessions

**Status:** DONE
**Priority:** Medium

## Description
The `viewStore` tracks which panels are expanded or minimized, but this state is lost on page refresh. Persist it to `localStorage` so users return to the same layout they left.

## Acceptance Criteria
- Panel expanded/minimized states survive a page reload
- Key used: `sis-view-state`
- Only store `panelViews` (not `expandedPanel`, since that re-derives from panelViews)
- Migration: unknown keys in saved data are ignored; new panels default to `normal`
- Reset via existing `settingsStore.resetToDefaults()` also clears the view state key
- `viewStore.test.ts` updated to cover persistence (localStorage read/write)

## Files to modify
- `src/store/viewStore.ts` — add localStorage load + persist on every mutation
- `src/test/stores/viewStore.test.ts` — add persistence coverage
