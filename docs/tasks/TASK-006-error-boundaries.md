# TASK-006: Error Boundaries & WebSocket Improvements

## Status: TODO

## Goal
Add React error boundaries around each panel so a single panel crash doesn't take down the whole dashboard. Also add a WebSocket message queue so messages received during reconnect aren't lost, and add server heartbeat keep-alive.

## Acceptance Criteria
- [ ] Each panel wrapped in an `ErrorBoundary` component that shows a "Panel error — click to reload" fallback
- [ ] ErrorBoundary resets when user clicks the fallback
- [ ] WebSocket reconnect queues messages received during disconnect and replays them on reconnect
- [ ] Ping/pong heartbeat sent every 30s to detect silent disconnects
- [ ] All existing WebSocket tests still pass

## Files to Touch
- `src/components/layout/ErrorBoundary.tsx` — new class component
- `src/components/layout/PanelGrid.tsx` — wrap each panel with ErrorBoundary
- `src/hooks/useWebSocket.ts` — add message queue, heartbeat
- `src/test/hooks/useWebSocket.test.ts` — add heartbeat + queue tests
