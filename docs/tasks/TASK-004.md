# TASK-004: Alert CSV Export

## Status: DONE

## Description
Operators need to export the current alert list as a CSV file for incident reporting. Add a single "Export CSV" button to the AlertPanel header that downloads a file named `alerts-<ISO-date>.csv` containing all currently-filtered alerts.

## Goals
- Export button in `AlertPanel` header
- CSV columns: `id`, `timestamp`, `threat_level`, `sensor_family`, `sensor_id`, `message`, `acknowledged`
- Respects the active filter (exports only what is currently displayed)
- File named `alerts-YYYY-MM-DD.csv`
- Unit test for the CSV generation utility

## Acceptance Criteria
- [x] "Export CSV" button visible in AlertPanel header
- [x] Clicking it triggers a browser file download
- [x] CSV header row + one row per displayed alert
- [x] Filename includes today's date
- [x] Works correctly when 0 alerts are shown (exports header only)
- [x] Utility function tested in isolation
