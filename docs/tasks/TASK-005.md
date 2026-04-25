# TASK-005 — Camera Component Tests

## Status: DONE

## Goal
Add Vitest + React Testing Library tests for all camera components introduced in TASK-003.
There are currently zero tests for these files.

## Acceptance Criteria
- [x] `CameraStatusBadge` — renders correct label and colour class for all 5 states
- [x] `CameraCard` — renders name, IP, status; fires edit and delete callbacks
- [x] `CameraFormModal` — renders add form; renders pre-filled edit form; calls onSave with correct payload
- [x] `CameraGrid` — renders loading skeleton, empty state, and populated grid
- [x] `CameraPlayer` — renders iframe fallback when HLS not supported (jsdom)
- [x] `cameraStore` — unit tests: addCamera, updateCamera, deleteCamera, setFilter
- [x] All NEW tests pass alongside the existing 273 (total 326 — 53 new tests added)

## Files to create
| File | Tests |
|------|-------|
| `src/test/components/cameras/CameraStatusBadge.test.tsx` | ~5 tests |
| `src/test/components/cameras/CameraCard.test.tsx` | ~8 tests |
| `src/test/components/cameras/CameraFormModal.test.tsx` | ~8 tests |
| `src/test/components/cameras/CameraGrid.test.tsx` | ~6 tests |
| `src/test/components/cameras/CameraPlayer.test.tsx` | ~4 tests |
| `src/test/stores/cameraStore.test.ts` | ~8 tests |

## Notes
- Use the same vitest + jsdom setup as existing tests (`src/test/setup.tsx`)
- Mock `hls.js` — jsdom has no Media Source Extensions
- Mock `src/api/cameras.ts` to avoid real fetch calls
