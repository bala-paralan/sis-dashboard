# TASK-002: Test coverage for camera components and remaining panels

## Status: pending

## Description
TASK-003 added the camera management UI (CameraGrid, CameraCard, CameraFormModal, CameraPlayer, CameraStatusBadge) but added no tests. Several panels also lack coverage: CounterUASPanel, PersonnelPanel, PowerPanel, CommandPanel, AdvancedAIPanel, WeatherPanel, SettingsPanel.

Write Vitest + React Testing Library tests for all of these so the full suite remains green.

## Acceptance Criteria
- [ ] Tests for all 5 camera components (CameraGrid, CameraCard, CameraFormModal, CameraPlayer, CameraStatusBadge)
- [ ] Tests for CounterUASPanel
- [ ] Tests for PersonnelPanel
- [ ] Tests for PowerPanel
- [ ] Tests for CommandPanel
- [ ] Tests for AdvancedAIPanel
- [ ] Tests for WeatherPanel
- [ ] Tests for SettingsPanel
- [ ] All existing 273 tests still pass
- [ ] Total test count increases by at least 60 tests

## Depends on
TASK-001 (completed), TASK-003 (completed)
