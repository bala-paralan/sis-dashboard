# TASK-005: Full Test Coverage — Camera Components, Stores, Hook & MinimizedViews

**Status:** COMPLETED  
**Branch:** `claude/zen-goldberg-3B4lg`

## Description
Add Vitest/React Testing Library tests for every previously untested file:
camera components (5), Zustand stores (3: cameraStore, viewStore, settingsStore),
the `useIsMobile` hook, and the `MinimizedViews` / `PanelMiniView` panel.

Also cherry-picked TASK-004 commit from `claude/zen-goldberg-hy2rx` to bring
this branch up to date (adds 6 panel tests, restores docs/tasks/).

## Test files created

### Camera components (`src/test/components/cameras/`)
- [x] `CameraStatusBadge.test.tsx` — 10 tests: all 5 status variants, colour classes
- [x] `CameraCard.test.tsx`        — 16 tests: name/location/meta rendering, Live/Test/Edit/Delete
                                      callbacks, confirm dialog, test-result display, null fields
- [x] `CameraFormModal.test.tsx`   — 12 tests: add/edit mode titles, field rendering,
                                      submit callback, error handling, RTSP not pre-filled in edit
- [x] `CameraGrid.test.tsx`        — 15 tests: toolbar, empty/loading/populated states,
                                      error banner, pagination count, add/edit modal open,
                                      delete confirm
- [x] `CameraPlayer.test.tsx`      — 7 tests: camera name header, startStream on mount,
                                      close button, onClose callback, fallback to cameraId,
                                      skip startStream when URL cached

### Stores (`src/test/stores/`)
- [x] `cameraStore.test.ts`        — 21 tests: initial state, loadCameras (success/error/filters),
                                      addCamera, editCamera, removeCamera, testCamera,
                                      selectCamera, startStream/stopStream, filter setters
- [x] `viewStore.test.ts`          — 13 tests: initial state, getView, setPanelView,
                                      toggleExpand (expand/collapse/single-expanded invariant),
                                      toggleMinimize (minimize/restore/clear expandedPanel)
- [x] `settingsStore.test.ts`      — 22 tests: initial state, toggleWidget, isWidgetVisible,
                                      togglePanel, isPanelVisible, setWidgetOption,
                                      setDefaultExpandedPanel, setSettingsOpen,
                                      widgetsByCategory, resetToDefaults

### Hook (`src/test/hooks/`)
- [x] `useIsMobile.test.ts`        — 8 tests: false/true returns, default/custom breakpoint
                                      in media query string, event-driven updates,
                                      addEventListener/removeEventListener lifecycle

### Panels (`src/test/components/panels/`)
- [x] `MinimizedViews.test.tsx`    — 15 tests: null for unknown panelId, render for each of 12
                                      known panel IDs, specific assertions for map/alerts/video/
                                      health/power/weather/advancedai/personnel/counteruas

## Acceptance Criteria
- [x] 9 new test files created across cameras, stores, hooks, and panels directories
- [x] `vitest run` shows 505 tests, all passing (351 → 505, +154 tests)
- [x] No regressions in the existing 351 tests
- [x] CounterUASPanel test fix: `queryAllByText` replaces `queryByText` for UAS label (was failing from TASK-004)
