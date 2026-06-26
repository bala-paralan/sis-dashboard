# TASK-005: Alert Export & Incident Report Download

## Status: DONE

## Description
The CommandPanel has an "Incident Report Generator" widget and the AlertPanel has no export mechanism. Operators need to export alert logs and generate incident reports as downloadable PDFs or CSV files.

## Requirements
1. Add "Export CSV" button to AlertPanel — exports all filtered alerts as CSV (timestamp, threat_level, classification, sensor_refs, acknowledged, annotation)
2. Add "Generate Report" button to CommandPanel — creates a structured incident report (HTML → print-to-PDF) with: summary, node statuses, alert log, threat timeline
3. Use browser `Blob` + `URL.createObjectURL` for CSV download (no external dependencies)
4. Use `window.print()` with a print-only stylesheet for the PDF report

## Acceptance Criteria
- [x] "Export CSV" button appears in AlertPanel filter bar
- [x] Clicking it downloads a file named `alerts-YYYY-MM-DD.csv` with all current filtered alerts
- [x] "Generate Report" button in CommandPanel opens a print dialog with formatted report
- [x] Report includes: generated-at timestamp, node status table, alert log, operator narrative
- [x] Shift Handover "Sign & Export PDF" also opens print dialog with handover summary
- [x] All existing tests continue to pass (273/273)
