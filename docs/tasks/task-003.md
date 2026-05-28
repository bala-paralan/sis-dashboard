# TASK-003: Camera Management UI

**Status:** COMPLETED  
**Commit:** `bbad4db`

## Description
Implement full camera management UI: grid view, HLS stream player, and
CRUD modals (add / edit / delete). Backed by a Zustand camera store and
typed REST API wrappers.

## Acceptance Criteria
- [x] `CameraGrid` — paginated card grid with status/site filters
- [x] `CameraCard` — shows name, location, manufacturer, model, last-seen and test result
- [x] `CameraStatusBadge` — colour-coded ONLINE / OFFLINE / DEGRADED / ERROR / MAINTENANCE
- [x] `CameraFormModal` — controlled form for add/edit with validation
- [x] `CameraPlayer` — HLS stream via hls.js with fallback native `<video>`
- [x] `cameraStore` — Zustand store with CRUD, stream start/stop, filtering
- [x] `src/api/cameras.ts` — typed fetch wrappers for all endpoints
- [x] All existing 273 tests remain green
