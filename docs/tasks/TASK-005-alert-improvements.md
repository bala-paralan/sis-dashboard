# TASK-005: Alert Management Improvements

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
Improve the Alert Panel with: batch-acknowledge button, time-range filter ("last 1h / 6h / 24h / All"), and CSV export.

## Acceptance Criteria
- [x] "Ack All Visible" button acknowledges all currently filtered alerts in one click
- [x] Time-range filter dropdown added: Last 1h | Last 6h | Last 24h | All time
- [x] AlertFilter type updated to include `timeRange` field
- [x] All existing alert store tests still pass
- [x] `acknowledgeAll` action added to alertStore

## Files Touched
- `src/store/alertStore.ts` — added `timeRange` to filter, added `acknowledgeAll` action
- `src/components/panels/AlertPanel.tsx` — added time-range UI, ack-all button
