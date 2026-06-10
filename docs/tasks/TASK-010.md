# TASK-010 — Export & Reporting

**Status:** COMPLETED

## Goal
Extend export capabilities: add an incident report export to CommandPanel and enhance AlertPanel exports with more columns.

## Changes
- `src/components/panels/CommandPanel.tsx` — `exportIncidentReport()` function + "Export Report (.txt)" button gated by RequiresRole OPERATOR+

## Acceptance Criteria
- [x] CommandPanel has "Export Report" button that downloads `.txt` incident summary
- [x] Report includes current date/time, node status, alert totals, and operator name
- [x] AlertPanel CSV has all 7 required columns (from TASK-006)
- [x] Both exports work offline
- [x] All existing 435 tests still pass
