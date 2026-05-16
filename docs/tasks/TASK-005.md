# TASK-005: Alert CSV export

**Status**: DONE  
**Priority**: Medium

## Goal
Allow operators to download the currently-filtered alert list as a CSV file
directly from the AlertPanel toolbar.

## Acceptance criteria
- [ ] "Export CSV" button appears in the AlertPanel filter bar
- [ ] Clicking the button generates a UTF-8 CSV with columns:
      id, timestamp, threat_level, classification, location, source_sensors,
      acknowledged, description
- [ ] Only the *filtered* alerts (respecting current threat-level / family / ack
      filters) are exported
- [ ] File is named `alerts_<ISO-date>.csv` and triggers a browser download
- [ ] A utility function `exportAlertsToCSV(alerts)` is unit-tested in
      src/test/utils/exportAlerts.test.ts
- [ ] All existing 273 + TASK-004 tests remain green
