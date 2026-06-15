# TASK-007: Alert Export & Sensor History Download

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
Let operators export alerts to CSV and download sensor history snapshots.

## Acceptance Criteria
- [x] "Export CSV" button in AlertPanel downloads all visible (filtered) alerts as a CSV file
- [x] CSV columns: timestamp, id, threat_level, sensor_family, description, acknowledged, annotation
- [x] "Download History" button per sensor in SensorFamilyPanel (hover to reveal ↓ button)
- [x] Files named `alerts_<ISO-date>.csv` and `sensor_<id>_<ISO-date>.json`
- [x] Exports work entirely client-side (no API call needed)

## Files Touched
- `src/utils/exporters.ts` — new file with `exportAlertsCSV()` and `exportSensorHistoryJSON()`
- `src/components/panels/AlertPanel.tsx` — added Export CSV button
- `src/components/panels/SensorFamilyPanel.tsx` — added hover Download History button per card
