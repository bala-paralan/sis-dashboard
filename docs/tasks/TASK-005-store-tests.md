# TASK-005: Add Tests for Remaining Stores

**Status:** DONE  
**Priority:** High

## Description
Three Zustand stores lack unit tests: `settingsStore`, `viewStore`, and `cameraStore`.

## Acceptance Criteria
- settingsStore: widget visibility toggles, panel visibility, category grouping, reset
- viewStore: expand/minimize/restore panel states, mutual-exclusion of expanded panels
- cameraStore: load cameras, add, edit, delete, pagination, test connectivity
- All new tests pass with `npm run test:frontend`

## Files to create
- `src/test/stores/settingsStore.test.ts`
- `src/test/stores/viewStore.test.ts`
- `src/test/stores/cameraStore.test.ts`
