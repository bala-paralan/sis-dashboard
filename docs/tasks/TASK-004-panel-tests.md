# TASK-004: Add Tests for Uncovered Panels

**Status:** completed  
**Priority:** high

## Description

8 panel components currently have zero test coverage. Add Vitest + React Testing Library tests for each.

## Panels to Cover

- [ ] `AdvancedAIPanel` — behavioral heatmap, false alarm tracker, confidence bins
- [ ] `CommandPanel` — node overview, incident report, handover notes
- [ ] `CounterUASPanel` — drone detection, bearing indicators, RF signatures
- [ ] `PersonnelPanel` — GPS tracking, GPR events, MAD readings, geofence
- [ ] `PowerPanel` — power nodes, vehicle health, export button
- [ ] `WeatherPanel` — conditions, forecast, sensor recommendations
- [ ] `SettingsPanel` — 5-tab configuration UI
- [ ] `MinimizedViews` — compact KPI strips

## Acceptance Criteria

- Each panel has at least 8 meaningful tests
- Tests cover: render, key data display, user interactions, loading/error states
- All existing 273 tests continue to pass
- New tests follow existing patterns (mock stores, Vitest globals)
