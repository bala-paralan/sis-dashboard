# TASK-007: DeviceConfigPage Tests

## Status: DONE

## Objective
Add a Vitest/React Testing Library test suite for `src/components/pages/DeviceConfigPage.tsx`, which currently has no coverage.

## Scope

### Files to create
- `src/test/components/pages/DeviceConfigPage.test.tsx`

## Acceptance Criteria
- Renders the 4-tab layout (General, Network, Sensors, Advanced)
- Each tab becomes active on click
- Form fields within each tab are rendered correctly
- Save / Reset actions trigger the expected store calls
- All tests pass
