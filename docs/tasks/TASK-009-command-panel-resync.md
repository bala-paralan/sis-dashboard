# TASK-009: Command Panel CIBMS Resync

**Status**: COMPLETE  
**Priority**: LOW  
**Estimated Effort**: Small

## Description
Command panel "↺ Resync" button for CIBMS feed has no handler. When clicked:
1. Show "Syncing…" state on button for 1.5s
2. Refresh the queue depth counter (randomize within realistic range)
3. Update last-sync timestamp to now

## Acceptance Criteria
- [ ] Button shows loading state during sync
- [ ] Queue depth and timestamp update after sync
- [ ] All 273 tests still pass

## Files to Modify
- `src/components/panels/CommandPanel.tsx`
