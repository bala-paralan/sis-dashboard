# TASK-014 — Alert Statistics Panel

**Status:** COMPLETED

## Goal
Add a dedicated Alert Statistics panel that gives commanders an at-a-glance overview of alert volumes by severity and sensor family, plus acknowledgement rate and a recent-alerts list.

## Requirements
- New `AlertStatsPanel` component wired into the main grid as the `alertstats` panel
- Severity summary cards (CRITICAL / HIGH / MEDIUM / LOW) with live counts from alertStore
- Sensor-family breakdown: horizontal bar chart using recharts (already a dependency)
- Acknowledgement rate % with colour-coded progress bar
- Recent 5 alerts list (newest first, with severity badge)
- Panel registered in `PanelGrid.ALL_PANELS` and `LeftSidebar.NEW_PANELS`
- Respects `settingsStore.isPanelVisible('alertstats')`

## Changes
- `src/components/panels/AlertStatsPanel.tsx` — new component
- `src/components/layout/PanelGrid.tsx` — add alertstats panel def
- `src/components/layout/LeftSidebar.tsx` — add alertstats nav entry
- `src/test/components/panels/AlertStatsPanel.test.tsx` — 10 tests

## Acceptance Criteria
- [x] AlertStatsPanel renders 4 severity cards with correct counts
- [x] Sensor-family breakdown bar chart renders
- [x] Acknowledgement rate displays correctly (% of total)
- [x] Recent alerts list shows newest 5 (unacked first)
- [x] Panel visible in sidebar navigation under ADDITIONAL PANELS
- [x] All existing 435 tests still pass; 10 new tests added
