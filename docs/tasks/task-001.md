# TASK-001: Migrate Inline Styles to Tailwind + Fix All Tests

**Status:** COMPLETED  
**Commit:** `15853df`

## Description
Migrate all inline CSS styles to Tailwind utility classes across the entire
codebase, and ensure all 273 tests pass green.

## Acceptance Criteria
- [x] All `style={{ ... }}` props replaced with Tailwind classes where possible
- [x] All 273 tests pass (`vitest run`)
- [x] Build succeeds (`vite build`)

## Notes
CSS custom properties (`var(--...)`) were kept inline where Tailwind does not
have an equivalent utility, e.g. theme colour tokens.
