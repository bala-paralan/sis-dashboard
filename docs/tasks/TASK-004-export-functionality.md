# TASK-004: Implement Export Functionality

**Status**: COMPLETE  
**Priority**: HIGH  
**Estimated Effort**: Medium

## Description
Several panels have export buttons with no implementation. Wire up export logic for:

1. **CommandPanel** — "Export PDF → BHQN" and "Sign & Export PDF" (incident report via `window.print`)
2. **AdvancedAIPanel** — "Export PNG" (heatmap canvas screenshot), "Export Audit CSV" (rejected alerts log)
3. **CounterUASPanel** — "Export KML" (drone track geometry in KML format)
4. **PowerPanel** — "Export Report" (CSV of node power readings)

## Acceptance Criteria
- [ ] Clicking each export button triggers a download or print dialog
- [ ] CSV/KML exports produce valid file downloads with correct MIME type
- [ ] PNG export captures the visible canvas element
- [ ] PDF export uses browser print dialog with print-only styles
- [ ] All 273 tests still pass after changes

## Files to Modify
- `src/components/panels/CommandPanel.tsx`
- `src/components/panels/AdvancedAIPanel.tsx`
- `src/components/panels/CounterUASPanel.tsx`
- `src/components/panels/PowerPanel.tsx`
- `src/utils/exportUtils.ts` (new file)
