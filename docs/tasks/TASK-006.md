# TASK-006: Eliminate Remaining Inline Styles (App.tsx + Layout)

## Status: DONE

## Summary
TASK-001 migrated inline styles to Tailwind across most components but `App.tsx` still uses `style={{}}` props for the shell layout. This task completes the migration.

## Scope
- `src/App.tsx` — replace all `style={{}}` with Tailwind utilities
- Verify `src/components/layout/PanelGrid.tsx` uses only Tailwind / CSS vars
- Add or update Tailwind safelist entries in `tailwind.config.js` if needed

## Acceptance Criteria
- `grep -r 'style={{' src/App.tsx` returns nothing
- All 273+ tests still pass
- `npx tsc --noEmit` clean
