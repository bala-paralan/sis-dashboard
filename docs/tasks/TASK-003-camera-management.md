# TASK-003: Camera Management UI

**Status:** COMPLETED  
**Commit:** `bbad4db`

## Description
Full IP camera management page integrated into the dashboard: grid of camera cards, live HLS player, CRUD modals for add/edit, and connection test functionality.

## Acceptance Criteria
- [x] `CameraGrid` — paginated grid with status/site filters, add button
- [x] `CameraCard` — displays name, location, status badge, manufacturer, model, last-seen, test result; Live / Test / Edit / Delete actions
- [x] `CameraStatusBadge` — colour-coded pill for ONLINE / OFFLINE / DEGRADED / ERROR / MAINTENANCE
- [x] `CameraFormModal` — add and edit form with validation
- [x] `CameraPlayer` — HLS stream viewer via hls.js
- [x] `useCameraStore` — Zustand store wiring CRUD, stream start/stop, filter state
- [x] Camera API client (`src/api/cameras.ts`) — typed wrappers for REST endpoints
- [x] Camera panel accessible via "IP Cameras" entry in LeftSidebar
