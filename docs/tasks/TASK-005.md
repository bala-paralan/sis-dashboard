# TASK-005: Implement Export Functionality

## Status: In Progress

## Goal
Wire up the "Export" buttons that currently have no `onClick` handlers across multiple panels.
Implement three export formats:
1. **CSV** — alert log export from AlertPanel
2. **PDF** — incident report print export from CommandPanel  
3. **KML** — drone track export from CounterUASPanel

## Scope
- New `src/utils/exporters.ts` — pure utility functions (no UI coupling)
- `src/components/panels/AlertPanel.tsx` — add CSV export button handler
- `src/components/panels/CommandPanel.tsx` — implement "Export PDF → BHQN" handler
- `src/components/panels/CounterUASPanel.tsx` — implement "Export KML" handler

## Acceptance Criteria
- [ ] `exportAlertsCSV(alerts)` generates a properly formatted CSV and triggers download
- [ ] `exportIncidentPDF()` opens browser print dialog with a styled print-specific layout
- [ ] `exportTracksKML(tracks)` generates a valid KML document and triggers download
- [ ] All three export functions are covered by unit tests in `src/test/utils/exporters.test.ts`
- [ ] Export buttons show a brief "Exported!" toast or visual confirmation
- [ ] All 273 existing tests still pass

## CSV Format
```
id,timestamp,threat_level,classification,location,sensor_family,acknowledged
```

## KML Format
Standard KML 2.2 Placemark with Point coordinates per track position.

## PDF
Uses `window.print()` with `@media print` CSS — no external library required.
