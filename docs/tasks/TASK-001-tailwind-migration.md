# TASK-001: Tailwind CSS Migration & Test Suite Fix

**Status:** COMPLETED  
**Commit:** `15853df`

## Description
Migrate all inline `style={{}}` props across layout and panel components to Tailwind utility classes. Fix all 273 Vitest tests to pass cleanly.

## Acceptance Criteria
- [x] No inline style props except where CSS variables are required (dynamic colours from theme)
- [x] All 273 tests green (`npm test`)
- [x] No TypeScript errors

## Notes
CSS variable-based dynamic values (e.g. `color: 'var(--alert-critical)'`) are exempt from migration as Tailwind cannot express runtime-dynamic tokens.
