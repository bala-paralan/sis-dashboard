# TASK-010: Accessibility (ARIA Labels & Keyboard Navigation)

## Status: TODO

## Goal
Add ARIA roles and labels to all interactive elements so the dashboard is usable with screen readers and keyboard-only navigation. Focus on the most critical panel controls.

## Acceptance Criteria
- [ ] All buttons have `aria-label` or visible text labels
- [ ] Alert Panel filter dropdowns have `aria-label`
- [ ] Panel expand/minimize controls have `aria-label="Expand <panel name>"` / `aria-label="Minimize"`
- [ ] TopNavBar site selector and scenario selector have ARIA labels
- [ ] ConnectionBadge has `role="status"` and `aria-live="polite"`
- [ ] LeftSidebar navigation items have `role="navigation"` wrapper
- [ ] Tab components in AI/ML and Sensor Family panels have `role="tablist"` / `role="tab"` / `role="tabpanel"` and keyboard arrow-key navigation
- [ ] All changes verified not to break existing tests

## Files to Touch
- `src/components/layout/TopNavBar.tsx`
- `src/components/layout/LeftSidebar.tsx`
- `src/components/layout/PanelShell.tsx`
- `src/components/widgets/ConnectionBadge.tsx`
- `src/components/panels/AlertPanel.tsx`
- `src/components/panels/AIMLPanel.tsx`
- `src/components/panels/SensorFamilyPanel.tsx`
