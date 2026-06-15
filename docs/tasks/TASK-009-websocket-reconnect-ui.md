# TASK-009: WebSocket Reconnect UI & Connection Status Improvements

## Status: COMPLETED (Session 2 — 2026-06-15)

## Goal
Show a visible reconnect countdown banner when the WebSocket is disconnected, and add a manual "Reconnect Now" button. ConnectionBadge shows latency when connected.

## Acceptance Criteria
- [x] When WS disconnects, a `ReconnectBanner` appears at top of PanelGrid: "Connection lost — retrying in Xs"
- [x] Banner has a "Reconnect Now" button that triggers immediate reconnect
- [x] Banner auto-dismisses when connection is restored
- [x] ConnectionBadge shows latency (ms) when connected (via PING/PONG heartbeat)
- [x] `latencyMs` and `reconnectCountdown` added to systemStore
- [x] All existing tests still pass

## Files Touched
- `src/store/systemStore.ts` — added `latencyMs`, `reconnectCountdown`, setters
- `src/hooks/useWebSocket.ts` — exposes latency from PONG, countdown via startCountdown
- `src/components/layout/PanelGrid.tsx` — `ReconnectBanner` component shown above all layouts
- `src/components/widgets/ConnectionBadge.tsx` — shows latency when connected, ARIA role
