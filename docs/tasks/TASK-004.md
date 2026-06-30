# TASK-004: Test Coverage for New Stores and Camera Components

**Status:** 🔄 IN PROGRESS (Session 2)

## Objective
Add comprehensive test suites for the three stores added in TASK-002/003 that have no coverage yet, plus all five camera UI components from TASK-003.

## Scope

### Stores (src/test/stores/)
- `viewStore.test.ts` — setPanelView, toggleExpand, toggleMinimize, getView, expandedPanel constraint
- `settingsStore.test.ts` — toggleWidget, setWidgetOption, togglePanel, resetToDefaults, localStorage persistence, widgetsByCategory
- `cameraStore.test.ts` — loadCameras, addCamera, editCamera, removeCamera, testCamera, startStream, stopStream, filters, pagination

### Camera Components (src/test/components/cameras/)
- `CameraStatusBadge.test.tsx` — all 5 status variants render correct label and color class
- `CameraCard.test.tsx` — renders camera info, calls onEdit/onDelete/onTest/onPlay callbacks
- `CameraFormModal.test.tsx` — form validation, submit fires createCamera/updateCamera, close/cancel
- `CameraPlayer.test.tsx` — mounts HLS player, shows error state, destroy on unmount
- `CameraGrid.test.tsx` — renders grid, pagination, status filter, add/edit/delete flow

## Acceptance Criteria
- [ ] All new test files pass
- [ ] Total test count grows from 273 to ≥ 350
- [ ] `npm run test:frontend` exits 0
