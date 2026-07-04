# TASK-005: Bug Fixes — WeatherPanel Wind Speed & DeviceConfigPage

**Status:** COMPLETED

## Description
Fix three identified bugs in the dashboard:

1. **WeatherPanel: invisible wind speed text** — `WindCompass` SVG text element has `fill="transparent"`, making the wind speed value invisible.
2. **DeviceConfigPage: non-deterministic signal bars** — Port signal bar width uses `Math.random()` inline in the JSX render expression, causing bars to change width on every re-render.
3. **DeviceConfigPage: node selector is display-only** — The node selector `<select>` in the Port Configuration tab has no `onChange` handler.

## Acceptance Criteria
- [x] Wind speed text in `WindCompass` is visible — `fill` changed from `"transparent"` to `"rgba(255,255,255,0.7)"`
- [x] Signal bar widths are stable across re-renders — replaced `Math.random()` with `stableSignalPct()` (deterministic hash on port ID, 60–99%)
- [x] Node selector `onChange` wired — `selectedNode` state added to `PortConfigTab`; select is now controlled
- [x] All 348 tests continue to pass
