# TASK-010: Accessibility (ARIA Labels & Keyboard Navigation)

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
Add ARIA roles and labels to all interactive elements so the dashboard is usable with screen readers and keyboard-only navigation.

## Acceptance Criteria
- [x] All buttons have `aria-label` or visible text labels
- [x] Alert Panel filter buttons have `aria-pressed` and `aria-label`, dropdowns have `aria-label`
- [x] Panel expand/minimize controls have `aria-label` (already in PanelShell HeaderBtn title)
- [x] TopNavBar site selector has `aria-label="Select site"`
- [x] ConnectionBadge has `role="status"` and `aria-live="polite"` and `aria-label`
- [x] LeftSidebar navigation has `role="navigation"` and `aria-label="Main navigation"`
- [x] Sensor family filter buttons have `aria-pressed` and `aria-label`
- [x] SensorFamilyPanel tabs have `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"`
- [x] ReconnectBanner has `role="status"` and `aria-live="polite"`

## Files Touched
- `src/components/layout/TopNavBar.tsx` — `aria-label` on site selector
- `src/components/layout/LeftSidebar.tsx` — `role="navigation"`, `aria-label` on sensor family buttons
- `src/components/widgets/ConnectionBadge.tsx` — `role="status"`, `aria-live`, `aria-label`
- `src/components/panels/AlertPanel.tsx` — `aria-label` and `aria-pressed` on filter controls
- `src/components/panels/SensorFamilyPanel.tsx` — `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `src/components/layout/PanelGrid.tsx` — `role="status"`, `aria-live` on ReconnectBanner
