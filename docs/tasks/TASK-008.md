# TASK-008: Fix TypeScript Errors

## Status: COMPLETED

## Goal
Resolve all TypeScript errors reported by `npx tsc --noEmit` so the project
compiles cleanly.

## Scope
- Remove unused `React` namespace imports from panels that use JSX transform
  - `src/components/panels/AlertPanel.tsx`
  - `src/components/panels/LiveMapPanel.tsx`
  - `src/components/panels/VideoPanel.tsx`
- Replace `global.` with `globalThis.` in test files that cause TS2304
  - `src/test/setup.tsx`
  - `src/test/components/panels/VideoPanel.test.tsx`
  - `src/test/components/widgets/ScenarioSelector.test.tsx`
  - `src/test/hooks/useWebSocket.test.ts`

## Acceptance Criteria
- [x] `npx tsc --noEmit` reports zero errors
- [x] All 525 existing tests still pass
