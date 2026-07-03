# TASK-006: CSV and JSON export for alerts and incidents

## Status: pending

## Description
Add export buttons to AlertPanel and CommandPanel (incident report tab) allowing operators to download the current alert/incident data as CSV or JSON. No server required — generate and trigger download client-side.

## Acceptance Criteria
- [ ] AlertPanel has an "Export CSV" button that downloads all visible alerts
- [ ] CommandPanel incident tab has "Export JSON" button for the report data
- [ ] Exported CSV includes: timestamp, severity, sensor, message, status
- [ ] File name includes the current date/time
- [ ] Tests for the export utility functions

## Depends on
TASK-002
