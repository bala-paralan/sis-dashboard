# TASK-005: CSV Export for Alerts & Sensor History

## Status: COMPLETED ✅

## Scope
Add one-click CSV download buttons to:
1. **AlertPanel** – export currently-filtered alerts as CSV
2. **SensorFamilyPanel** – export sensor reading history for the active family as CSV

## Approach
Implement a shared `exportCsv(filename, rows)` utility in `src/utils/exportCsv.ts` that
builds a CSV string and triggers a browser download via a transient `<a>` element.

## Acceptance Criteria
- [x] AlertPanel has a "⬇ CSV" button that downloads filtered alerts
- [x] SensorFamilyPanel has a "⬇ CSV" button that downloads sensor list for the active family tab
- [x] CSV files have correct headers matching the data fields
- [x] All tests remain green (280 passing, +7 new exportCsv tests)

## Implementation
- `src/utils/exportCsv.ts` — shared `exportCsv(filename, rows)` utility
- `src/components/panels/AlertPanel.tsx` — CSV button in filter bar (disabled when no alerts)
- `src/components/panels/SensorFamilyPanel.tsx` — CSV button in stats bar (disabled when no sensors)
- `src/test/utils/exportCsv.test.ts` — 7 unit tests for the CSV utility
