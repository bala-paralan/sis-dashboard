# TASK-006: Global toast/error notification system

**Status:** DONE

## Description
Add a global toast notification system so that errors and important events surface to the user instead of being silently logged to the console. Covers:
- API errors (camera CRUD failures, auth failures)
- WebSocket disconnect/reconnect events
- Alert acknowledgement confirmation

## Acceptance Criteria
- [x] Toast component (success, error, warning, info variants) — `src/components/widgets/Toast.tsx`
- [x] toastStore + `toast.success/error/warning/info()` helpers accessible anywhere
- [x] Camera CRUD operations show success/error toasts (cameraStore)
- [x] WebSocket disconnect shown as warning toast; reconnect as success (App.tsx)
- [x] Toasts auto-dismiss after 4 seconds; dismissable by click
- [x] Accessible (role="alert", aria-live="polite")
- [x] All existing tests still pass
