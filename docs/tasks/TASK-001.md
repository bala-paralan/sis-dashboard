# TASK-001 — Tailwind CSS Migration

**Status:** ✅ DONE  
**Commit:** `15853df`

## Description

Migrate all static inline `style={{}}` objects to Tailwind utility classes across all 25 panel, layout and widget components.  Dynamic runtime values (data-driven colours, computed grid dimensions) are legitimately retained as `style={{}}`.

## Scope

- All components under `src/components/layout/`, `src/components/panels/`, and `src/components/widgets/`
- Fix test regressions introduced by the style changes (ConnectionBadge ellipsis, PanelShell button titles, SensorStatusGrid data-testid, VideoPanel img/detection format, LiveMapPanel/SensorFamilyPanel sr-only headings, TopNavBar multi-combobox, viewStore state leak)

## Acceptance Criteria

- [x] All static `style={{}}` objects replaced with Tailwind classes
- [x] Build clean (`npm run build` passes)
- [x] All 273 tests green
