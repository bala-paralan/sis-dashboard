# TASK-005: CSV Export for Alerts

## Status: DONE

## Summary
Operators need to be able to export the current filtered alert list to a CSV file for
incident reporting. The export button should appear in the AlertPanel header and respect
the current threat-level and sensor-family filters.

## Requirements
- "Export CSV" button in AlertPanel stats bar
- CSV columns: id, timestamp, classification, threat_level, sensor_family, location, acknowledged
- File name format: `sis-alerts-YYYY-MM-DD_HHmm.csv`
- Respects active threat-level and sensor-family filters (exports only visible rows)
- Works in all browsers via Blob + anchor download trick
- Unit test verifies the CSV content generation logic

## Acceptance criteria
- Button visible in AlertPanel
- Clicking downloads a correctly formatted CSV
- Exported rows match the currently filtered view
- All existing tests still pass
