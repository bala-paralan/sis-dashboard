# TASK-005: Test Coverage for New Panels

**Status:** ✅ COMPLETED (Session 2)  
**Commit:** `5178795 feat(TASK-005): add test coverage for 8 new panel components`

## Objective
Add test suites for the 8 new panel components introduced in TASK-002 that currently have no test coverage.

## Scope (src/test/components/panels/)
- `CounterUASPanel.test.tsx` — drone track display, threat indicators, panel renders
- `PersonnelPanel.test.tsx` — personnel list, NavIC/GPS board, GPR scan viewer renders
- `PowerPanel.test.tsx` — vehicle health, power/energy metrics render
- `CommandPanel.test.tsx` — incident report form, shift handover summary, node overview
- `AdvancedAIPanel.test.tsx` — behavioral heatmap, false alarm tracker, model confidence
- `WeatherPanel.test.tsx` — visibility forecast, weather data display
- `SettingsPanel.test.tsx` — widget toggle, panel toggle, reset to defaults
- `MinimizedViews.test.tsx` — renders minimized strip for each panel type

## Acceptance Criteria
- [ ] All 8 new test files pass
- [ ] Total test count grows by ≥ 60 from TASK-004 baseline
- [ ] `npm run test:frontend` exits 0
