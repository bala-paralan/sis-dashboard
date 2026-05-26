# TASK-009: Add Test for useIsMobile Hook

**Status:** DONE  
**Priority:** Low

## Description
The `useIsMobile` hook has no dedicated test. Add a unit test using vitest's jsdom environment.

## Acceptance Criteria
- Test verifies hook returns false on a wide viewport (> 768px)
- Test verifies hook returns true on a narrow viewport (≤ 768px)
- Resize event triggers re-evaluation

## Files to create
- `src/test/hooks/useIsMobile.test.ts`
