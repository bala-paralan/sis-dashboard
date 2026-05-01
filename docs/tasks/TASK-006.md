# TASK-006: Sensor Registry Management Page

**Status:** IN PROGRESS (Session 3 — 2026-05-01)

## Description
The `sensorStore` only holds live WebSocket state. Add a full Sensor Registry management page (similar to the IP Camera management page from TASK-003) so operators can view all registered sensors, edit their configuration and alert thresholds, and toggle them active/inactive.

## Acceptance Criteria
- [ ] `src/api/sensors.ts` — typed REST wrappers: `fetchSensors()` (paginated + filters), `fetchSensor()`, `updateSensorConfig()`, `setSensorThresholds()`, `toggleSensorActive()`
- [ ] `src/store/sensorStore.ts` — enhanced with `registryList`, `registryLoading`, `registryError`, `registryPage`, `registryTotal`; actions: `loadSensors()`, `selectRegistrySensor()`, `updateConfig()`, `setThresholds()`, `toggleActive()`; existing live-data actions preserved
- [ ] `src/components/sensors/SensorRegistry.tsx` — full-screen page: table with sensor ID, name, modality, site, status badge, active toggle, last-seen; filters: modality/status/site dropdowns + text search; pagination; click row → SensorDetailModal
- [ ] `src/components/sensors/SensorDetailModal.tsx` — view/edit modal: sensor metadata, threshold sliders (min/max), active toggle, Save/Cancel; shows load error inline
- [ ] `src/components/layout/PanelGrid.tsx` — `activePanel === 'sensor-registry'` renders `<SensorRegistry />`
- [ ] `src/components/layout/LeftSidebar.tsx` — "Sensor Registry" nav item (icon 📋) below IP Cameras
- [ ] `src/test/stores/sensorStore.test.ts` — tests for all new registry store actions
- [ ] `src/test/components/sensors/SensorRegistry.test.tsx` — loading skeleton, empty state, table render, filter/search, pagination
- [ ] `src/test/components/sensors/SensorDetailModal.test.tsx` — view mode, edit mode, threshold editing, save, cancel, error display
- [ ] All existing tests remain green; total test count ≥ 430

## Notes
Session 3 implementation.
