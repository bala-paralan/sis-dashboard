# TASK-007 — Toast / Notification System

## Status: DONE

## Goal
Add a lightweight in-app toast system so user-facing actions (camera saved,
alert acknowledged, login error, export downloaded) give clear success/error
feedback instead of silent UI updates.

## Acceptance Criteria
- [x] A `toastStore` (Zustand) manages a queue of `{ id, type, message, duration }` items
- [x] `<ToastContainer>` renders in the top-right corner, above all content (z-index)
- [x] Toasts auto-dismiss after their `duration` (default 3 s)
- [x] Four types: `success` (green), `error` (red), `warning` (amber), `info` (blue)
- [x] Toasts can be dismissed early by clicking the ✕ button
- [x] `useToast()` convenience hook exposes `toast.success()`, `toast.error()`, etc.
- [x] Camera CRUD actions (add/edit/delete) emit success/error toasts
- [x] Alert acknowledgement emits a success toast
- [x] `toastStore` unit tests in `src/test/stores/toastStore.test.ts`
- [x] `ToastContainer` render test in `src/test/components/widgets/ToastContainer.test.tsx`
- [x] All existing tests continue to pass (348 total — 75 new tests added in this session)

## Files to create / modify
| File | Action |
|------|--------|
| `src/store/toastStore.ts` | Create — queue + actions |
| `src/hooks/useToast.ts` | Create — convenience hook |
| `src/components/widgets/ToastContainer.tsx` | Create — rendered UI |
| `src/App.tsx` | Modify — mount `<ToastContainer />` |
| `src/components/cameras/CameraGrid.tsx` | Modify — emit toasts on CRUD |
| `src/components/panels/AlertPanel.tsx` | Modify — emit toast on ack |
| `src/test/stores/toastStore.test.ts` | Create |
| `src/test/components/widgets/ToastContainer.test.tsx` | Create |
