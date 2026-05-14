# TASK-008: Expand Test Coverage

## Status: In Progress

## Goal
Add unit and integration tests for all new functionality introduced in TASK-004 through
TASK-007. Achieve meaningful coverage of the export utilities, auth flow, action buttons,
and new UI components.

## New Test Files
- `src/test/utils/exporters.test.ts` — unit tests for CSV/KML/PDF export functions
- `src/test/stores/authStore.test.ts` — unit tests for authStore login/logout/persist
- `src/test/components/layout/ProtectedRoute.test.tsx` — redirect behaviour tests
- `src/test/components/widgets/ConfirmModal.test.tsx` — modal open/close/confirm
- `src/test/components/widgets/ActionToast.test.tsx` — toast visibility and auto-dismiss
- `src/test/components/widgets/DemoModeBanner.test.tsx` — renders when demo mode active

## Acceptance Criteria
- [ ] `exportAlertsCSV` test: correct header row + correct number of data rows
- [ ] `exportTracksKML` test: output contains `<kml` and `<Placemark` tags
- [ ] `authStore` test: login sets `isAuthenticated=true`, logout clears state
- [ ] ProtectedRoute test: renders children when authenticated, redirects when not
- [ ] ConfirmModal test: `onConfirm` called on confirm button click, not on cancel
- [ ] Total test count >= 295 (add at least 22 new tests)
- [ ] `npm run test:frontend` exits 0

## Implementation Notes
- Use `@testing-library/react` + `vitest` consistent with existing test patterns
- Mock `window.URL.createObjectURL` and `document.createElement('a').click` in export tests
- ProtectedRoute tests need `MemoryRouter` from `react-router-dom`
