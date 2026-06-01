# TASK-010: Toast / Notification System

## Status: COMPLETED

## Goal
Add a lightweight toast notification system so panels can surface success /
error feedback (e.g. camera save, alert acknowledge, logout) without modal
interruption. Integrate it with the authStore logout and cameraStore actions.

## Scope
- `src/store/toastStore.ts`       — Zustand store (add / remove toasts)
- `src/components/ui/ToastContainer.tsx` — fixed overlay, auto-dismiss
- Wire ToastContainer into `src/main.tsx` (sibling of BrowserRouter children)
- `src/test/stores/toastStore.test.ts`   — store unit tests
- `src/test/components/ui/ToastContainer.test.tsx` — render / dismiss tests

## Acceptance Criteria
- [x] toastStore: addToast, removeToast, clearToasts work correctly
- [x] ToastContainer renders visible toasts and auto-dismisses after timeout
- [x] 27 new tests, all passing
- [x] Existing 557 tests continue to pass (584 total)
