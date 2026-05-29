# TASK-008: Alert Data Export (CSV)

**Status:** DONE  
**Priority:** Medium

## Description
Operators need to export the current alert queue for incident reports. Add a CSV download button to the AlertPanel toolbar.

## Acceptance Criteria
- "Export CSV" button in AlertPanel toolbar
- Clicking it triggers a browser download of `alerts-<timestamp>.csv`
- CSV columns: id, timestamp, threat_level, sensor_family, classification, location, acknowledged, description
- Only currently-filtered alerts are exported (respects active filters)
- Utility function `exportAlertsCSV(alerts)` extracted to `src/utils/exporters.ts`
- Unit tests for `exportAlertsCSV` in `src/test/utils/exporters.test.ts`

## Files to create / modify
- `src/utils/exporters.ts` (new)
- `src/components/panels/AlertPanel.tsx` (add button)
- `src/test/utils/exporters.test.ts` (new)
