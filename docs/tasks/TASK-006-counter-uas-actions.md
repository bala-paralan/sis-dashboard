# TASK-006: Counter-UAS Action Buttons

**Status**: COMPLETE  
**Priority**: MEDIUM  
**Estimated Effort**: Small

## Description
Counter-UAS panel has "Engage QRT" and "Log Engagement" buttons with no handlers.

1. **Engage QRT** — Show confirmation modal before "engaging"; on confirm, add a CRITICAL alert
   to alertStore and mark the drone contact as ENGAGED
2. **Log Engagement** — Append an engagement record to localStorage for audit trail;
   show brief toast confirmation

## Acceptance Criteria
- [ ] Engage QRT requires confirmation click before action
- [ ] Engagement creates a CRITICAL alert visible in AlertPanel
- [ ] Log Engagement writes to localStorage key `sis_engagement_log`
- [ ] Toast feedback shown for both actions
- [ ] All 273 tests still pass

## Files to Modify
- `src/components/panels/CounterUASPanel.tsx`
- `src/store/alertStore.ts`
