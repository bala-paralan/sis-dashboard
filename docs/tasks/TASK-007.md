# TASK-007: Integrate react-router-dom for page routing

**Status:** pending  
**Priority:** medium

## Description
`react-router-dom` is installed but not wired up. The app currently renders
all panels in a single flat view. Add proper routing so:

- `/` → main dashboard (current PanelGrid layout)
- `/cameras` → standalone Camera Management page
- `/device-config` → DeviceConfigPage

## Acceptance Criteria
- [ ] `BrowserRouter` / `Routes` set up in `main.tsx` or `App.tsx`
- [ ] Top navigation links route to the above paths
- [ ] All existing tests still pass
- [ ] Camera management accessible at `/cameras`
