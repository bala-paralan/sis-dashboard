# TASK-003 — Camera Management UI

**Status**: COMPLETED
**Commit**: `feat(TASK-003): add camera management UI — grid, player, CRUD modals`

## Objective
Build a full camera management interface: grid listing, RTSP player,
add/edit/delete modals, connection testing, and HLS stream launch.

## Acceptance Criteria
- [x] `CameraGrid` — paginated camera list with status badges and filters
- [x] `CameraCard` — per-camera card with status, last-seen, and actions
- [x] `CameraFormModal` — add/edit form with RTSP URL, credentials, site fields
- [x] `CameraPlayer` — HLS.js video player with fallback placeholder
- [x] `CameraStatusBadge` — colour-coded status pill component
- [x] `cameraStore` — Zustand store wiring CRUD + stream start/stop to REST API
- [x] `src/api/cameras.ts` — typed REST wrappers (fetchCameras, create, update, delete, test, stream)

## Notes
Backend REST API (`VITE_API_URL`) required for live operation. Store handles loading/error
states so the UI gracefully degrades when the backend is unavailable.
