# TASK-005: Alert Management Improvements

## Status: DONE (Session 1)

## Goal
Improve the Alert Panel with: annotation display on acknowledged alerts, batch-acknowledge button, and a time-range filter ("last 1h / 6h / 24h / All").

## Acceptance Criteria
- [x] Acknowledged alerts show their annotation text (if provided) inline (was already in AlertRow)
- [x] "Ack All Visible" button acknowledges all currently filtered alerts in one click
- [x] Time-range filter dropdown added: Last 1h | Last 6h | Last 24h | All time
- [x] AlertFilter type in alertStore updated to include `timeRange` field
- [x] All existing alert store & panel tests still pass
- [x] New tests cover batch-ack (3 tests) and time-range filter logic (2 tests)

## Files to Touch
- `src/store/alertStore.ts` — add `timeRange` to filter, add `acknowledgeAll` action
- `src/components/panels/AlertPanel.tsx` — add time-range UI, ack-all button, annotation display
- `src/test/stores/alertStore.test.ts` — add new test cases
- `src/test/components/panels/AlertPanel.test.tsx` — add new test cases
