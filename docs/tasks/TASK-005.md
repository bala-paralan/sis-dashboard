# TASK-005: New Panel Test Coverage

## Status: PENDING

## Goal
Add Vitest/Testing Library tests for the panels added after TASK-001:
CounterUASPanel, PersonnelPanel, PowerPanel, CommandPanel, AdvancedAIPanel,
WeatherPanel, SettingsPanel, MinimizedViews.

## Scope
- `src/test/components/panels/CounterUASPanel.test.tsx`
- `src/test/components/panels/PersonnelPanel.test.tsx`
- `src/test/components/panels/PowerPanel.test.tsx`
- `src/test/components/panels/CommandPanel.test.tsx`
- `src/test/components/panels/AdvancedAIPanel.test.tsx`
- `src/test/components/panels/WeatherPanel.test.tsx`
- `src/test/components/panels/SettingsPanel.test.tsx`
- `src/test/components/panels/MinimizedViews.test.tsx`

## Acceptance Criteria
- [ ] All new tests pass alongside existing 273 tests
- [ ] Each panel has at minimum: renders without crashing, key UI elements visible, interactive controls work
