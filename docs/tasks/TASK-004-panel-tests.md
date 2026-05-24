# TASK-004: Add Tests for New Panels

**Status:** DONE  
**Priority:** High

## Description
Add Vitest unit tests for the six panels introduced after the initial release that currently have no test coverage:
- CounterUASPanel
- AdvancedAIPanel
- PersonnelPanel
- PowerPanel
- CommandPanel
- WeatherPanel

## Acceptance Criteria
- Each panel renders without throwing
- Key data elements (headings, contact counts, metric values) are present in the DOM
- Widget visibility toggles (isWidgetVisible) are respected
- Toolbar buttons exist and are clickable
- Tests run cleanly with `npm run test:frontend`

## Files to create
- `src/test/components/panels/CounterUASPanel.test.tsx`
- `src/test/components/panels/AdvancedAIPanel.test.tsx`
- `src/test/components/panels/PersonnelPanel.test.tsx`
- `src/test/components/panels/PowerPanel.test.tsx`
- `src/test/components/panels/CommandPanel.test.tsx`
- `src/test/components/panels/WeatherPanel.test.tsx`
