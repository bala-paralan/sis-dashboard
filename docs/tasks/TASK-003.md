# TASK-003: Camera Management UI

**Status:** ✅ COMPLETED  
**Commit:** `feat(TASK-003): add camera management UI — grid, player, CRUD modals`

## Description
Build a full IP camera management page: camera grid, HLS stream player, add/edit/delete modals, connection test, and status badges. Backed by a Zustand store and a mock REST API layer.

## Acceptance Criteria
- [x] CameraGrid — paginated grid of camera cards with filter controls
- [x] CameraCard — thumbnail, status badge, select/deselect
- [x] CameraPlayer — HLS.js stream player with loading/error states
- [x] CameraFormModal — add / edit form with validation
- [x] CameraStatusBadge — ONLINE / OFFLINE / ERROR / UNKNOWN colours
- [x] cameraStore — Zustand store with loadCameras, CRUD, stream start/stop
- [x] cameras API — mock REST layer (fetchCameras, createCamera, etc.)
- [x] Integrated into PanelGrid as full-screen "cameras" activePanel

## Files Changed
- `src/api/cameras.ts`
- `src/store/cameraStore.ts`
- `src/components/cameras/` — 5 new components
- `src/components/layout/PanelGrid.tsx` — cameras routing
