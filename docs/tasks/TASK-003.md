# TASK-003: IP Camera Management UI

**Status:** COMPLETED (commit `bbad4db`)

## Description
Add a full IP Camera management page reachable from the sidebar. Users should be able to list, add, edit, delete, test connectivity and launch a live HLS stream for any camera registered in the backend.

## Acceptance Criteria
- [x] `src/api/cameras.ts` — typed REST wrappers (CRUD + test + stream start/stop)
- [x] `src/store/cameraStore.ts` — Zustand store with optimistic UI and pagination
- [x] `src/components/cameras/CameraCard.tsx` — card showing status badge, metadata and action buttons
- [x] `src/components/cameras/CameraFormModal.tsx` — Add / Edit modal with field validation
- [x] `src/components/cameras/CameraPlayer.tsx` — HLS player via hls.js with native Safari fallback
- [x] `src/components/cameras/CameraGrid.tsx` — paginated grid with status/site filters and refresh
- [x] `src/components/cameras/CameraStatusBadge.tsx` — colour-coded status badge component
- [x] Wired into `PanelGrid` under `activePanel === 'cameras'`
- [x] All existing 273 tests remain green

## Notes
RTSP URL is never pre-filled in the Edit modal (encrypted at rest on the backend).
