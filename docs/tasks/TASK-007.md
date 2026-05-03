# TASK-007: Remaining Inline Style Cleanup

**Status**: Pending  
**Branch**: `claude/zen-goldberg-FrQX6`

## Goal
Remove residual `style={{ ... }}` blocks from `App.tsx` and convert them to Tailwind utility classes (continued from TASK-001).

## Scope
- `src/App.tsx` — three `style={{}}` props (app-shell, inner div, backdrop) → Tailwind
- `src/components/layout/PanelGrid.tsx` — extract repeated padding/gap values to CSS variables or Tailwind where values are static

## Acceptance Criteria
- [ ] Zero `style={{` occurrences in `App.tsx`
- [ ] All 273+ tests still passing after style migration
- [ ] No visual regressions (layout unchanged)
