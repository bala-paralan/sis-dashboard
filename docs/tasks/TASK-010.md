# TASK-010: Hook tests — useIsMobile

## Scope
Write unit tests for `src/hooks/useIsMobile.ts`.

## Files to test
- `src/hooks/useIsMobile.ts`

## Test file
- `src/test/hooks/useIsMobile.test.ts`

## Acceptance criteria
- Returns true when window.innerWidth <= breakpoint (default 768)
- Returns false when window.innerWidth > breakpoint
- Calls matchMedia with correct query string
- Updates when MediaQueryList fires a change event
- Works with custom breakpoint argument
- Cleans up event listener on unmount
