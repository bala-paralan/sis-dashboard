# TASK-006: Error Boundaries & WebSocket Improvements

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
ErrorBoundary was already in PanelShell. This task adds WebSocket message queue so messages received during reconnect aren't lost, and adds server heartbeat keep-alive.

## Acceptance Criteria
- [x] Each panel wrapped in an `ErrorBoundary` (already in PanelShell)
- [x] ErrorBoundary resets when user clicks the fallback (already in PanelShell)
- [x] WebSocket reconnect queues messages received during disconnect and replays them on reconnect
- [x] Ping/pong heartbeat sent every 30s to detect silent disconnects
- [x] All existing WebSocket tests still pass

## Files Touched
- `src/hooks/useWebSocket.ts` — added message queue, 30s heartbeat ping/pong
