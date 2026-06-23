# TASK-004: Fix TypeScript errors

**Status:** DONE

## Description
Fix all TypeScript compiler errors in the codebase:
1. Three unused `React` imports (AlertPanel, LiveMapPanel, VideoPanel) — TS6133
2. `global` identifier not found in test files (VideoPanel.test, ScenarioSelector.test, useWebSocket.test) — TS2304

## Acceptance Criteria
- [x] `npx tsc --noEmit` exits with zero errors
- [x] All 273 tests still pass
- [x] No functional regressions
