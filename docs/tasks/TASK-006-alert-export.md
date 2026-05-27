# TASK-006: Alert Export (CSV & JSON)

**Status:** DONE  
**Priority:** Medium  
**Estimated effort:** 2–3 hours

## Goal
Add an "Export" button to the Alert panel that lets operators download the current
filtered alert list as either a CSV or JSON file.

## Acceptance Criteria
- [ ] "Export ▾" dropdown button appears in the AlertPanel header (right side)
- [ ] "Export CSV" — downloads `alerts_<timestamp>.csv` with columns:
      id, timestamp, threat_level, sensor_family, sensor_id, message, acknowledged
- [ ] "Export JSON" — downloads `alerts_<timestamp>.json` with full Alert objects
- [ ] Export respects active filters (only exports visible/filtered alerts)
- [ ] Utility function `exportAlerts(alerts, format)` lives in `src/utils/exporters.ts`
- [ ] Unit tests added for `exportAlerts`

## Implementation Notes
- Use native `Blob` + `URL.createObjectURL` + `<a download>` pattern (no library needed)
- Revoke the object URL after click to avoid memory leaks
- CSV must handle commas/quotes in message text (RFC-4180 quoting)
