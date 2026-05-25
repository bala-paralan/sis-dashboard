# TASK-005: Fix AlertFilter Type Inconsistency + Add ViewStore Tests

## Status: DONE

## Summary
Two issues:
1. `AlertFilter` in `src/types/sensors.ts` declares `timeRange` and `showAcknowledged` fields that don't match the actual `alertStore.ts` shape (`acknowledged: 'ALL' | 'UNACKED' | 'ACKED'`). The exported type is stale and misleading.
2. `viewStore.ts` has no tests despite covering critical logic (single-expanded-panel invariant, minimize/expand state machine).

## Scope
- Update `AlertFilter` in `src/types/sensors.ts` to match `alertStore.ts`
- Add `src/test/stores/viewStore.test.ts` covering setPanelView, toggleExpand, toggleMinimize, getView, the single-expanded invariant
- Add `src/test/stores/cameraStore.test.ts` covering all store actions

## Acceptance Criteria
- `npx tsc --noEmit` passes with zero errors
- All tests pass
- viewStore has ≥ 10 test cases
