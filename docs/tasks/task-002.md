# TASK-002: Test Coverage for Remaining Components

**Status:** COMPLETED

## Description
Add Vitest/React Testing Library tests for every component and store that
was not covered by TASK-001.  Target: ≥ 340 tests passing.

## Components / stores without tests (as of TASK-001 completion)

### Panels
- [x] AdvancedAIPanel
- [x] CommandPanel
- [x] CounterUASPanel
- [x] MinimizedViews (PanelMiniView — 13 panel IDs)
- [x] PersonnelPanel
- [x] PowerPanel
- [x] SettingsPanel
- [x] WeatherPanel

### Camera components
- [x] CameraCard
- [x] CameraStatusBadge
- [x] CameraFormModal
- [x] CameraGrid
- [x] CameraPlayer

### Stores
- [x] cameraStore
- [x] viewStore
- [x] settingsStore

## Acceptance Criteria
- [x] All new test files created under `src/test/`
- [x] `vitest run` shows 461 tests, all passing
- [x] No regressions in the existing 273 tests

## Status: COMPLETED (session 2)
