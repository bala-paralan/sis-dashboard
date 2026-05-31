# TASK-005: Unit tests for untested panel components

## Status: DONE

## Goal
Add unit tests for all panel components that currently have no test coverage:
- `AdvancedAIPanel`
- `CommandPanel`
- `CounterUASPanel`
- `PersonnelPanel`
- `PowerPanel`
- `SettingsPanel`
- `WeatherPanel`
- `MinimizedViews`

## Deliverables
- `src/test/components/panels/AdvancedAIPanel.test.tsx`
- `src/test/components/panels/CommandPanel.test.tsx`
- `src/test/components/panels/CounterUASPanel.test.tsx`
- `src/test/components/panels/PersonnelPanel.test.tsx`
- `src/test/components/panels/PowerPanel.test.tsx`
- `src/test/components/panels/SettingsPanel.test.tsx`
- `src/test/components/panels/WeatherPanel.test.tsx`
- `src/test/components/panels/MinimizedViews.test.tsx`

## Acceptance Criteria
- Each component renders without crashing
- Key UI elements are asserted
- All new tests pass alongside existing suite
