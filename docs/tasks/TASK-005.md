# TASK-005: Incident Report Export (PDF/CSV)

## Status: DONE

## Description
Add export capability to the Command & Reporting panel. Users should be able to export incident reports as PDF (printable) and alert logs as CSV.

## Requirements
- "Export PDF" button in Command & Reporting panel
- "Export CSV" button for alert log table
- PDF: incident summary, timestamps, sensor IDs, threat level, recommended actions
- CSV: alert_id, timestamp, type, severity, sensor, acknowledged_by, notes
- Use browser print dialog for PDF (no server needed)
- Use Blob + URL.createObjectURL for CSV download

## Acceptance Criteria
- [ ] Export PDF button triggers browser print with formatted report
- [ ] Export CSV downloads a valid CSV file with all current alerts
- [ ] Both buttons visible and functional in Command & Reporting panel
- [ ] Tests pass
