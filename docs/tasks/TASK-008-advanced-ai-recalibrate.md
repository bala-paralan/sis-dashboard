# TASK-008: Advanced AI — Model Recalibrate Action

**Status**: COMPLETE  
**Priority**: LOW  
**Estimated Effort**: Small

## Description
AdvancedAIPanel has a "Recalibrate" button for the LSTM model with no handler.
When clicked it should:
1. Show a brief "Recalibrating…" spinner on the button for 2s
2. Reset the LSTM confidence distribution to a balanced baseline
3. Log a system event to systemStore

## Acceptance Criteria
- [ ] Button shows loading state during recalibration
- [ ] Confidence data resets after recalibration
- [ ] System event logged
- [ ] All 273 tests still pass

## Files to Modify
- `src/components/panels/AdvancedAIPanel.tsx`
- `src/store/systemStore.ts`
