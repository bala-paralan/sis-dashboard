# TASK-007: Incident Report JSON Export

## Status: TODO

## Goal
The Command & Reporting panel has a "Sign & Export PDF" stub. Replace the stub with
a working JSON export (backend PDF generation is out of scope) that downloads all
incident fields as structured JSON.

## Deliverables
- `src/utils/exportReport.ts` — `exportIncidentReport(report: IncidentReport)` that
  serialises report to JSON and triggers a browser download
- CommandPanel: wire the export button to the utility
- Filename: `sis-incident-<reportId>-<ISO-date>.json`
- Tests: export utility (structure validation, filename)

## Acceptance Criteria
- Clicking "Sign & Export" downloads a structured JSON file
- All existing 273 tests still pass; new tests added
