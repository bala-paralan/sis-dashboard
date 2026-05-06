# TASK-007 — Toast / Notification System

**Status:** COMPLETED (Session 1 — 2026-05-06)

## Goal
Add a lightweight in-app toast system so user-facing actions give clear success/error feedback.

## Acceptance Criteria
- [x] `toastStore` (Zustand) manages a queue of `{ id, type, message, duration }` items
- [x] `<ToastContainer>` renders in the top-right corner, above all content
- [x] Toasts auto-dismiss after their `duration` (default 3s)
- [x] Four types: `success` (green), `error` (red), `warning` (amber), `info` (blue)
- [x] Toasts can be dismissed early by clicking ✕
- [x] `useToast()` hook exposes `toast.success()`, `toast.error()`, etc.
- [x] Camera CRUD actions emit success/error toasts
- [x] Alert acknowledgement emits a success toast
- [x] Unit tests for `toastStore` and `ToastContainer`
- [x] All existing tests continue to pass (377 total)
