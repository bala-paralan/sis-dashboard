# TASK-008: Settings Panel — Wire Up Update Rates & Thresholds

## Status: TODO

## Goal
The SettingsStore already stores `updateRateHz` and `threshold` per widget, but panels ignore them. Wire panels to respect these live settings so operators can tune refresh rates and alert thresholds without redeployment.

## Acceptance Criteria
- [ ] Alert Panel respects `settings.alertPanel.maxAlerts` (default 200) for queue size
- [ ] System Health Panel uses `settings.systemHealth.cpuWarnThreshold` and `gpuWarnThreshold` for color coding
- [ ] Sensor Family Panel uses `settings.sensorFamily.updateRateHz` to throttle render
- [ ] Settings Panel UI shows sliders/inputs for these values (not just toggles)
- [ ] Changes apply live without page reload
- [ ] All existing tests still pass; new tests cover threshold application

## Files to Touch
- `src/store/settingsStore.ts` — ensure threshold fields exist for the three panels above
- `src/components/panels/AlertPanel.tsx` — read maxAlerts from settings
- `src/components/panels/SystemHealthPanel.tsx` — read CPU/GPU warn thresholds from settings
- `src/components/panels/SensorFamilyPanel.tsx` — read updateRateHz from settings
- `src/components/panels/SettingsPanel.tsx` — add slider/number inputs for the three panels
