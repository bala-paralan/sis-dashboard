# TASK-005: Alert Export (CSV / JSON)

**Status**: Done  
**Branch**: `claude/zen-goldberg-FrQX6`

## Goal
Add a one-click export button to AlertPanel that downloads the currently-filtered alert list as either CSV or JSON.

## Scope
- Add "⬇ Export" dropdown (CSV | JSON) to AlertPanel toolbar
- `src/utils/exportAlerts.ts` — pure helper that converts `Alert[]` to CSV string or JSON blob
- Wire download via a temporary `<a>` element (no external libs)
- Test the export util in `src/test/utils/exportAlerts.test.ts`

## Acceptance Criteria
- [ ] CSV export produces correct headers: `id,timestamp,classification,threat_level,sensor_family,location,acknowledged`
- [ ] JSON export produces a pretty-printed array
- [ ] Filename includes ISO date suffix, e.g. `alerts_2026-05-03.csv`
- [ ] Export button only enabled when filtered list is non-empty
- [ ] Unit tests for both CSV and JSON export util
