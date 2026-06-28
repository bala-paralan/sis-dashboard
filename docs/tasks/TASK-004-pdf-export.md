# TASK-004: PDF / Print Export for Reports

## Status: COMPLETED ✅

## Scope
Implement functional print/PDF export for the CommandPanel's two report types:
1. **Incident Report** – captures live node data, operator narrative, timestamp
2. **Shift Handover Summary** – captures period stats, handover notes, operator signature

## Approach
Use the browser's native `window.print()` with a dedicated print-only CSS class that
renders a clean A4-format report. No external library needed.

## Acceptance Criteria
- [x] "Export PDF → BHQN" button opens a print dialog with a formatted Incident Report
- [x] "Sign & Export PDF" button opens a print dialog with a formatted Shift Handover Summary
- [x] Print layout includes header (logo text, site, timestamp), body data, and operator narrative
- [x] All tests remain green (280 passing)

## Implementation
- `src/utils/printReport.ts` — `printReport(PrintReport)` builds an HTML document and calls `window.print()`
- `src/components/panels/CommandPanel.tsx` — `handleExportIncident()` and `handleExportHandover()` wired to buttons
