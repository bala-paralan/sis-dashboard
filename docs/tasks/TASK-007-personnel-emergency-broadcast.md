# TASK-007: Personnel Emergency Broadcast

**Status**: COMPLETE  
**Priority**: MEDIUM  
**Estimated Effort**: Small

## Description
PersonnelPanel "Emergency Broadcast" button has no handler. When clicked it should:
1. Show a confirmation modal with broadcast message template
2. On confirm, create a CRITICAL alert in alertStore with type "EMERGENCY_BROADCAST"
3. Log the broadcast to localStorage `sis_broadcast_log`

## Acceptance Criteria
- [ ] Button triggers confirmation modal
- [ ] Confirmed broadcast adds a CRITICAL alert to AlertPanel
- [ ] Broadcast logged to localStorage
- [ ] All 273 tests still pass

## Files to Modify
- `src/components/panels/PersonnelPanel.tsx`
- `src/store/alertStore.ts`
