# TASK-013: PanelGrid Component Tests

**Status:** DONE
**Priority:** Medium

## Description
`PanelGrid` is the main routing/layout component but has no test coverage. It has complex branching logic (settings/cameras/device full-screen, expanded layout, normal grid) that should be tested.

## Acceptance Criteria
- Renders the normal 6-panel grid when activePanel is 'map'
- Renders full-screen SettingsPanel when activePanel is 'settings'
- Renders full-screen CameraGrid when activePanel is 'cameras'
- Renders full-screen DeviceConfigPage when activePanel is 'device'
- Expanded layout renders correctly when a panel is toggled to expanded
- Panel visibility controlled by settingsStore.isPanelVisible

## Files to create
- `src/test/components/layout/PanelGrid.test.tsx`
