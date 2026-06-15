# TASK-008: Settings Panel — Wire Up Update Rates & Thresholds

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
Wire panels to respect live settings so operators can tune refresh rates and alert thresholds without redeployment.

## Acceptance Criteria
- [x] Alert Panel respects `settings.panelSettings.alertPanel.maxAlerts` (default 200)
- [x] System Health Panel uses `cpuWarnThreshold` and `gpuWarnThreshold` for color coding
- [x] Sensor Family Panel uses `sensorFamily.updateRateHz` to throttle render
- [x] Settings Panel UI shows sliders for these values under Thresholds tab
- [x] Changes apply live without page reload
- [x] All existing tests still pass

## Files Touched
- `src/store/settingsStore.ts` — added `panelSettings` with `alertPanel`, `systemHealth`, `sensorFamily`
- `src/components/panels/AlertPanel.tsx` — reads `maxAlerts`
- `src/components/panels/SystemHealthPanel.tsx` — reads `cpuWarnThreshold`, `gpuWarnThreshold`
- `src/components/panels/SensorFamilyPanel.tsx` — reads `updateRateHz`
- `src/components/panels/SettingsPanel.tsx` — added sliders for all three panel settings
