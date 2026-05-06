# TASK-006 — Alert CSV Export

**Status:** COMPLETED (Session 1 — 2026-05-06)

## Goal
Allow operators to export the currently-filtered alert list as a CSV file from the Alert Management panel.

## Acceptance Criteria
- [x] "Export CSV" button appears in the AlertPanel filter bar
- [x] Clicking it triggers a browser download of `alerts_<ISO-date>.csv`
- [x] CSV columns: `id`, `timestamp`, `threat_level`, `sensor_family`, `message`, `acknowledged`
- [x] Only the currently-filtered alerts are exported
- [x] Button disabled when 0 filtered alerts
- [x] `exportAlertsCSV(alerts)` utility in `src/utils/exportCSV.ts`
- [x] Unit tests in `src/test/utils/exportCSV.test.ts`
- [x] All existing tests continue to pass (377 total)
