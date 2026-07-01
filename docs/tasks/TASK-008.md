# TASK-008: SettingsPanel component tests

## Scope
Write unit tests for `src/components/panels/SettingsPanel.tsx`.

## Files to test
- `src/components/panels/SettingsPanel.tsx`

## Test file
- `src/test/components/panels/SettingsPanel.test.tsx`

## Acceptance criteria
- Renders without crashing
- Shows all 5 tabs: Widgets, Panels, Display, Layout, Thresholds
- Switching to Panels tab shows panel labels
- Switching to Display tab shows Theme section
- Switching to Layout tab shows Quick View Controls
- Switching to Thresholds tab shows threshold inputs
- "Reset to defaults" button calls resetToDefaults
- Widget category accordion expands/collapses on click
- Toggle buttons in Panels tab call togglePanel
