# TASK-006: Export & Reporting

## Status: DONE

## Goal
Enable operators to export alert data and sensor summaries as CSV files for offline analysis and incident reporting.

## Requirements
- "Export CSV" button in AlertPanel header — exports current filtered alerts
- CSV columns: timestamp, threat_level, sensor_family, description, location, acknowledged, acknowledged_by
- "Export Report" button in CommandPanel — generates a text-format incident summary
- Report includes: date/time range, total alerts by threat level, top sensors triggered, on-duty operator
- Download triggers browser file download (no server required — client-side generation)

## Acceptance Criteria
- [x] AlertPanel has Export CSV button
- [x] CSV download contains correct columns and current filter applied
- [x] CommandPanel has Export Report button
- [x] Report download is a `.txt` file with incident summary
- [x] Export works without network connection (pure client-side)
- [x] All existing tests still pass
