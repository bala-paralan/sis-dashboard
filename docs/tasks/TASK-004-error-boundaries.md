# TASK-004: Add React Error Boundaries to All Panels

**Status:** DONE  
**Priority:** High  
**Estimated effort:** 1–2 hours

## Goal
Wrap every panel in an error boundary so a runtime error in one panel does not crash
the entire dashboard shell.

## Acceptance Criteria
- [ ] `PanelErrorBoundary` class component created in `src/components/layout/`
- [ ] Shows a user-friendly error card (panel title, error message, "Retry" button)
- [ ] Applied around every panel inside `PanelGrid` and inside `PanelShell`
- [ ] Tests added for the error boundary component

## Implementation Notes
- React error boundaries must be class components (no hooks equivalent)
- Retry button should call `componentDidCatch` reset pattern (`this.setState({ hasError: false })`)
- Keep styling consistent with existing dark/light theme CSS variables
