# TASK-004: Unit Tests — Stores (cameraStore, settingsStore, viewStore)

**Status:** ✅ COMPLETED  
**Branch:** `claude/zen-goldberg-8vzI9`

## Description
Add comprehensive unit tests for the three stores that currently have no test coverage: `cameraStore`, `settingsStore`, and `viewStore`. Tests should mock external dependencies (API layer, localStorage) and verify all state transitions and actions.

## Acceptance Criteria
- [x] `cameraStore.test.ts` — loadCameras, addCamera, editCamera, removeCamera, testCamera, selectCamera, startStream, stopStream, setFilters
- [x] `settingsStore.test.ts` — toggleWidget, setWidgetOption, togglePanel, resetToDefaults, isPanelVisible, isWidgetVisible, widgetsByCategory, localStorage persistence
- [x] `viewStore.test.ts` — setPanelView, toggleExpand, toggleMinimize, getView, single-expanded invariant
- [x] All tests passing (349 total after TASK-004)

## Estimated LOC
~350 lines of test code
