# TASK-004: Test Coverage for Untested Panel Components

## Status: DONE

## Summary
Several panel components introduced in previous tasks have no unit tests. This task adds
Vitest + React Testing Library tests for each untested panel, bringing all panels to the
same standard as the initial 273-test suite.

## Panels to cover
| Component | File | Tests needed |
|-----------|------|--------------|
| CounterUASPanel | src/components/panels/CounterUASPanel.tsx | renders, drone contact table, RF sig display |
| CommandPanel | src/components/panels/CommandPanel.tsx | renders, node cards, status badges |
| PowerPanel | src/components/panels/PowerPanel.tsx | renders, battery/solar metrics, vehicle tab |
| WeatherPanel | src/components/panels/WeatherPanel.tsx | renders, current view, forecast view, recommendation |
| SettingsPanel | src/components/panels/SettingsPanel.tsx | renders, widget visibility toggles |
| AdvancedAIPanel | src/components/panels/AdvancedAIPanel.tsx | renders, tab switching |
| PersonnelPanel | src/components/panels/PersonnelPanel.tsx | renders, node status grid |
| MinimizedViews | src/components/panels/MinimizedViews.tsx | renders minimized state |

## Acceptance criteria
- All new tests pass alongside existing 273
- Each component file has at least 5 meaningful assertions
- Tests mock timers/intervals where components use setInterval
