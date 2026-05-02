# TASK-006 — Alert CSV Export

## Status: DONE

## Goal
Allow operators to export the currently-filtered alert list as a CSV file from the
Alert Management panel.

## Acceptance Criteria
- [x] "Export CSV" button appears in the AlertPanel filter bar
- [x] Clicking it triggers a browser download of `alerts_<ISO-date>.csv`
- [x] CSV columns: `id`, `timestamp`, `threat_level`, `sensor_family`, `message`, `acknowledged`
- [x] Only the currently-filtered alerts are exported (respects active filters)
- [x] Button is disabled / shows tooltip when there are 0 filtered alerts
- [x] A `exportAlertsCSV(alerts)` utility function lives in `src/utils/exportCSV.ts`
- [x] Unit tests for `exportAlertsCSV` in `src/test/utils/exportCSV.test.ts`
- [x] All existing tests continue to pass (335 total)

## Files to create / modify
| File | Action |
|------|--------|
| `src/utils/exportCSV.ts` | Create — CSV serialisation helper |
| `src/test/utils/exportCSV.test.ts` | Create — unit tests |
| `src/components/panels/AlertPanel.tsx` | Modify — add Export CSV button |

## Notes
- Use a pure browser `Blob` + `<a download>` approach — no server round-trip
- Escape commas and newlines in string fields (wrap in double-quotes)
- Keep the utility generic enough to reuse for future export needs
