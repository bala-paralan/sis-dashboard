# TASK-004: Unit tests for remaining Zustand stores

## Status: DONE

## Goal
Add comprehensive unit tests for the three untested Zustand stores:
- `src/store/cameraStore.ts`
- `src/store/settingsStore.ts`
- `src/store/viewStore.ts`

## Deliverables
- `src/test/stores/cameraStore.test.ts`
- `src/test/stores/settingsStore.test.ts`
- `src/test/stores/viewStore.test.ts`

## Acceptance Criteria
- All store actions and selectors are covered
- API calls in cameraStore are mocked with vi.mock
- localStorage interactions in settingsStore are tested
- All new tests pass alongside the existing 273
