# TASK-004: Test Coverage for 6 New Panels

**Status:** COMPLETED  
**Branch:** `claude/zen-goldberg-hy2rx`

## Description
Add Vitest/React Testing Library tests for the 6 panels introduced in the
UI overhaul that had no test coverage: CounterUASPanel, WeatherPanel,
PersonnelPanel, PowerPanel, CommandPanel, and AdvancedAIPanel.

## Test files created

- [x] `src/test/components/panels/CounterUASPanel.test.tsx` — 12 tests
- [x] `src/test/components/panels/WeatherPanel.test.tsx` — 14 tests
- [x] `src/test/components/panels/PersonnelPanel.test.tsx` — 12 tests
- [x] `src/test/components/panels/PowerPanel.test.tsx` — 12 tests
- [x] `src/test/components/panels/CommandPanel.test.tsx` — 14 tests
- [x] `src/test/components/panels/AdvancedAIPanel.test.tsx` — 14 tests

## Coverage added per panel

### CounterUASPanel
- Basic render, toolbar (contact count, alarm toggle, Notify QRT)
- Widget visibility (counterUasThreatDisplay, droneTrackPlayback)
- Playback speed buttons, Export KML

### WeatherPanel
- Basic render, tab switching (current ↔ forecast)
- Metric cards (Humidity, Visibility, Pressure, Wind)
- Sensor Recommendation section
- Widget visibility (visibilityWeatherForecast)
- MOSDAC/IMD attribution, WindCompass SVG

### PersonnelPanel
- Basic render, stats bar, personnel roster display
- Tab switching (Personnel → GPR → MAD)
- GPR empty/event state, MAD sensor IDs
- Emergency Broadcast button visibility toggle
- Battery indicator for each member

### PowerPanel
- Basic render, stats bar (nodes, low battery, vehicle fault badge)
- Tab switching (Power & Energy ↔ Vehicle Health)
- Node IDs (BOP-ALPHA-01 etc.), radial gauge SVGs
- Vehicle selection for detail expansion, tyre pressure panel
- Widget visibility (powerEnergyMonitor)

### CommandPanel
- Basic render, stats bar, CIBMS LINK ACTIVE indicator
- Tab switching (Nodes → Incident → Handover)
- All node IDs, ONLINE/OFFLINE/DEGRADED statuses
- Incident textarea (auto-populated + narrative input)
- Handover textarea and period summary
- CIBMS widget visibility toggle

### AdvancedAIPanel
- Basic render, FAR avg / Rejected / Alerts (7d) in stats bar
- Tab switching (Heatmap → False Alarm → Confidence)
- Time window selectors (1h, 6h, 24h)
- Confidence distribution range buckets (50-60% … 90-100%)
- Widget visibility (behaviouralPatternHeatmap)

## Acceptance Criteria
- [x] 6 new test files created under `src/test/components/panels/`
- [x] `vitest run` shows 351 tests, all passing (273 → 351, +78 tests)
- [x] No regressions in the existing 273 tests
- [x] `docs/tasks/` directory restored with task-001 through task-004
