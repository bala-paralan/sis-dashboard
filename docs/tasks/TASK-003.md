# TASK-003: Camera Management UI

**Status:** ✅ COMPLETED  
**Commit:** `bbad4db feat(TASK-003): add camera management UI — grid, player, CRUD modals`

## Objective
Build a full IP camera management interface including grid view, HLS video player, CRUD operations (add, edit, delete), status filtering, pagination, and reachability testing.

## Scope
- `cameraStore.ts` — Zustand store with CRUD, streaming, test, filter, paginate state
- `src/api/cameras.ts` — REST API client for camera endpoints
- `CameraGrid.tsx` — Main grid with CRUD modals, status filter, pagination
- `CameraCard.tsx` — Individual camera card with status badge and action buttons
- `CameraPlayer.tsx` — HLS video player using HLS.js
- `CameraFormModal.tsx` — Add/edit form with RTSP URL, credentials, site fields
- `CameraStatusBadge.tsx` — Visual status indicator (ONLINE/OFFLINE/DEGRADED/ERROR/MAINTENANCE)

## Acceptance Criteria
- [x] Camera list renders with status filtering and pagination
- [x] Add/edit/delete cameras via modal form
- [x] HLS stream playback in CameraPlayer
- [x] Reachability test (latency_ms display)
- [x] cameraStore integrated with REST API layer
