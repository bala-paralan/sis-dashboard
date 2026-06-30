# TASK-007: DeviceConfigPage Tests + Export / Report Generation

**Status:** ✅ COMPLETED (Session 3)  
**Commit:** `ad02767 feat(TASK-007): DeviceConfigPage tests + export utility + alert CSV export`

## Objective
Add test coverage for DeviceConfigPage and implement an export/print feature for incident reports generated in the CommandPanel.

## Scope

### Tests
- `src/test/components/pages/DeviceConfigPage.test.tsx` — tab switching, form fields render, save/reset actions

### Export Feature
- Add "Export PDF" / "Copy to Clipboard" button to CommandPanel incident report
- Add "Export CSV" button to AlertPanel for filtered alerts
- Utility: `src/utils/exporters.ts` — `alertsToCsv(alerts)`, `reportToText(report)`
- Tests: `src/test/utils/exporters.test.ts`

## Acceptance Criteria
- [ ] DeviceConfigPage tests pass
- [ ] CommandPanel has export button that triggers download/clipboard
- [ ] AlertPanel has export CSV for filtered alerts
- [ ] exporters.ts utility tested
