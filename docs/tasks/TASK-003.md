# TASK-003 — IP Camera Management UI

**Status:** ✅ DONE  
**Commit:** `bbad4db`

## Description

Full IP-camera management feature: CRUD UI, live HLS stream player, Zustand store, and a REST API client with JWT auto-refresh.

## Deliverables

- `src/api/client.ts` — axios-style fetch wrapper with JWT auto-refresh
- `src/api/auth.ts` — login / token-refresh endpoints
- `src/api/cameras.ts` — CRUD + stream-URL endpoints
- `src/store/cameraStore.ts` — Zustand store (list, add, edit, delete, filter)
- `src/components/cameras/CameraGrid.tsx` — paginated card grid with status/site filters
- `src/components/cameras/CameraCard.tsx` — status badge, test-result display, actions
- `src/components/cameras/CameraFormModal.tsx` — shared add/edit form
- `src/components/cameras/CameraPlayer.tsx` — HLS.js player with Safari native-HLS fallback
- `src/components/cameras/CameraStatusBadge.tsx` — colour-coded status pill

## Acceptance Criteria

- [x] Camera list with pagination and filters
- [x] Add / Edit / Delete modals
- [x] Live stream viewer (HLS.js)
- [x] JWT auto-refresh on 401
- [x] Wired as full-screen panel via LeftSidebar + PanelGrid
