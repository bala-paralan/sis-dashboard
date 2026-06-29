# TASK-005: Unit tests for cameraStore

**Status:** pending  
**Priority:** high

## Description
Add unit test coverage for `src/store/cameraStore.ts`, which handles camera
CRUD, pagination, stream URLs, test results, and filtering.

## Scope
- `src/store/cameraStore.ts`

## Acceptance Criteria
- [ ] `src/test/stores/cameraStore.test.ts` — ≥15 tests covering:
  - Initial state
  - addCamera / updateCamera / deleteCamera
  - Pagination (nextPage, prevPage, setPage)
  - setFilter, setSearch
  - setStreamUrl, setTestResult
  - selectCamera / clearSelection
- [ ] All existing tests still pass
