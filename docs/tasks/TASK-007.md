# TASK-007 — Toast / Notification System
**Status:** COMPLETED

## Goal
Add a lightweight in-app toast system for user-facing feedback.

## Acceptance Criteria
- [x] `src/store/toastStore.ts` — queue of `{ id, type, message, duration }` items
- [x] `src/hooks/useToast.ts` — `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`
- [x] `src/components/widgets/ToastContainer.tsx` — top-right overlay, auto-dismiss
- [x] `src/App.tsx` mounts `<ToastContainer>`
- [x] Unit tests: toastStore (7 tests) + ToastContainer (5 tests)
