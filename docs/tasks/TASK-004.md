# TASK-004 — CommandPanel: Functional PDF Export + Period Switching

**Status**: IN PROGRESS

## Objective
Complete the CommandPanel's two non-functional interactive features:
1. **PDF export** for Incident Reports and Shift Handover summaries
2. **Period switching** (8h / 12h / 24h) for Shift Handover content

## Background
`CommandPanel.tsx` has fully-designed UI for incident reporting and shift handover
but the export buttons have no `onClick` handlers, and the period toggle buttons
don't change the displayed summary period.

## Acceptance Criteria
- [ ] "Export PDF → BHQN" button triggers a formatted printable report via browser print dialog
- [ ] "Sign & Export PDF" button triggers a formatted shift-handover PDF
- [ ] "Attach Snapshot" opens a simple info dialog explaining the feature
- [ ] 8h / 12h / 24h buttons switch the displayed period and update the summary counts
- [ ] All existing tests continue to pass

## Implementation Notes
- Use `window.print()` with a dynamically created print window (no extra dependencies)
- Report content includes auto-populated live data from node states
- Period state lifted to local useState; summary content changes per selected period
