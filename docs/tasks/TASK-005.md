# TASK-005: Alert CSV Export

## Status: DONE

## Goal
Operators must be able to export the current filtered alert list to CSV for incident
reporting and offline analysis.

## Deliverables
- `src/utils/exportAlerts.ts` — `exportAlertsToCSV(alerts: Alert[])` utility that
  builds a CSV string and triggers a browser download
- Export button added to AlertPanel toolbar (visible only when alerts.length > 0)
- Columns: timestamp, id, threatLevel, sensorFamily, message, acknowledged,
  acknowledgedBy, acknowledgedAt, location lat/lng
- Filename: `sis-alerts-<ISO-date>.csv`
- Tests: exportAlerts utility (correct CSV structure, filename, edge cases)

## Acceptance Criteria
- Clicking export downloads a valid CSV
- Respects current filter (exports only visible alerts)
- Empty state: button disabled or hidden when no alerts
- All existing 273 tests still pass; new tests added
