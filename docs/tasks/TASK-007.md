# TASK-007: DeviceConfigPage Tests + settingsStore Tests

## Status: DONE

## Summary
`DeviceConfigPage.tsx` (961 lines) and `settingsStore.ts` (192 lines) have no tests. This task adds coverage for both.

## Scope
- `src/test/components/pages/DeviceConfigPage.test.tsx` — tab navigation, form inputs, save/reset behaviour
- `src/test/stores/settingsStore.test.ts` — all store actions

## Acceptance Criteria
- ≥ 15 new tests pass
- `npx tsc --noEmit` clean
