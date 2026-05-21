# TASK-006 — Alert CSV Export
**Status:** COMPLETED

## Goal
Allow operators to export the currently-filtered alert list as a CSV file.

## Acceptance Criteria
- [x] `src/utils/exportCSV.ts` — CSV serialisation helper
- [x] "Export CSV" button in AlertPanel filter bar
- [x] Downloads `alerts_<ISO-date>.csv` with columns: id, timestamp, threat_level, sensor_family, message, acknowledged
- [x] Button disabled when 0 filtered alerts
- [x] `src/test/utils/exportCSV.test.ts` — unit tests (8 tests)
