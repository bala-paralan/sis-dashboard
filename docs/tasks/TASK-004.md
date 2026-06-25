# TASK-004: Camera Component Tests

## Status: DONE

## Goal
Camera components were added in TASK-003 but have zero test coverage. Add a full test suite for every camera component so the suite grows from 273 → ~320 tests.

## Acceptance Criteria
- [ ] `CameraStatusBadge.test.tsx` — all four statuses render the correct label & colour class
- [ ] `CameraCard.test.tsx` — renders name, site, status badge; fires onSelect / onDelete callbacks
- [ ] `CameraGrid.test.tsx` — renders a list of cards; shows empty-state when list is empty; pagination buttons work
- [ ] `CameraPlayer.test.tsx` — mounts with a stream URL; shows placeholder when no URL; error overlay on HLS error
- [ ] `CameraFormModal.test.tsx` — create/edit mode; validates required fields; calls onSave / onClose
- [ ] All existing 273 tests continue to pass

## Files to create
- `src/test/components/cameras/CameraStatusBadge.test.tsx`
- `src/test/components/cameras/CameraCard.test.tsx`
- `src/test/components/cameras/CameraGrid.test.tsx`
- `src/test/components/cameras/CameraPlayer.test.tsx`
- `src/test/components/cameras/CameraFormModal.test.tsx`
