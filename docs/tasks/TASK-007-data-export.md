# TASK-007: Alert Export & Sensor History Download

## Status: TODO

## Goal
Let operators export alerts to CSV and download sensor history snapshots. These are the two most commonly requested data-off-take features for operational handover.

## Acceptance Criteria
- [ ] "Export CSV" button in AlertPanel downloads all visible (filtered) alerts as a CSV file
- [ ] CSV columns: timestamp, id, threat_level, sensor_family, description, acknowledged, annotation
- [ ] "Download History" button per sensor in SensorFamilyPanel downloads that sensor's raw history as JSON
- [ ] Files named `alerts_<ISO-date>.csv` and `sensor_<id>_<ISO-date>.json`
- [ ] Exports work entirely client-side (no API call needed)
- [ ] New tests for the export utility functions

## Files to Touch
- `src/utils/exporters.ts` — new file with `exportAlertsCSV()` and `exportSensorHistoryJSON()`
- `src/components/panels/AlertPanel.tsx` — add Export CSV button
- `src/components/panels/SensorFamilyPanel.tsx` — add Download History button per sensor card
- `src/test/utils/exporters.test.ts` — new test file
