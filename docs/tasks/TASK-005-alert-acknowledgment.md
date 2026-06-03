# TASK-005: Complete Alert Acknowledgment Flow

**Status**: COMPLETE  
**Priority**: HIGH  
**Estimated Effort**: Small

## Description
AlertPanel calls `acknowledgeAlert(id, '')` with an empty operator string. The acknowledgment
flow needs:
1. Operator name input (from settingsStore callsign, fallback to 'OPERATOR')
2. Visual confirmation feedback (toast / row highlight)
3. Filter to show/hide acknowledged alerts

## Acceptance Criteria
- [ ] Acknowledging an alert stamps it with the current operator callsign
- [ ] Acknowledged alerts visually distinct (muted/strikethrough)
- [ ] Toggle filter to show/hide acknowledged alerts works
- [ ] All 273 tests still pass

## Files to Modify
- `src/components/panels/AlertPanel.tsx`
- `src/store/alertStore.ts`
- `src/store/settingsStore.ts`
