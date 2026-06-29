# TASK-006: Unit tests for untested panels

**Status:** pending  
**Priority:** high

## Description
8 major panels and the DeviceConfigPage have no test coverage. Add a test
file for each.

## Scope
- `src/components/panels/CounterUASPanel.tsx`
- `src/components/panels/PersonnelPanel.tsx`
- `src/components/panels/PowerPanel.tsx`
- `src/components/panels/CommandPanel.tsx`
- `src/components/panels/AdvancedAIPanel.tsx`
- `src/components/panels/WeatherPanel.tsx`
- `src/components/panels/SettingsPanel.tsx`
- `src/components/panels/MinimizedViews.tsx`
- `src/components/pages/DeviceConfigPage.tsx`

## Acceptance Criteria
- [ ] One test file per panel under `src/test/components/panels/`
- [ ] One test file for DeviceConfigPage under `src/test/components/pages/`
- [ ] ≥8 tests per panel, ≥10 for DeviceConfigPage
- [ ] All existing tests still pass
