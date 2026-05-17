# TASK-006: Alert Management Enhancements

## Status: DONE

## Objective
Enhance the alert panel with acknowledge, dismiss, filter-by-severity, and CSV export capabilities.

## Scope

### Files to modify
- `src/components/panels/AlertPanel.tsx` — add acknowledge / dismiss buttons per row, severity filter dropdown, export button
- `src/store/alertStore.ts` — add acknowledgeAlert(id), dismissAlert(id) actions; add severityFilter state
- `src/utils/formatters.ts` — add exportAlertsCSV(alerts) helper

### Files to create
- `src/test/components/panels/AlertPanel.test.tsx` — update/extend existing tests for new controls
- `src/test/utils/exportAlerts.test.ts`

## Acceptance Criteria
- Each alert row shows Acknowledge and Dismiss buttons
- Acknowledged alerts render with a distinct visual state
- Dismissed alerts are hidden from the list
- Severity filter (All / Low / Medium / High / Critical) limits visible alerts
- Export button downloads a CSV with id, severity, message, timestamp columns
- All tests pass (existing 273 + new)
