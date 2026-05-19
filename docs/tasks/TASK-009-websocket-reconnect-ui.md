# TASK-009: WebSocket Reconnect UI & Connection Status Improvements

## Status: TODO

## Goal
Show a visible reconnect countdown banner when the WebSocket is disconnected, and add a manual "Reconnect Now" button. The current state just shows a badge with no user action path.

## Acceptance Criteria
- [ ] When WS disconnects, a banner appears at the top of PanelGrid: "Connection lost — reconnecting in Xs" with a countdown
- [ ] Banner has a "Reconnect Now" button that triggers immediate reconnect attempt
- [ ] Banner auto-dismisses when connection is restored
- [ ] ConnectionBadge in TopNavBar shows latency (ms) when connected (measured as WS ping round-trip)
- [ ] All existing tests pass

## Files to Touch
- `src/components/layout/PanelGrid.tsx` — add reconnect banner
- `src/components/widgets/ConnectionBadge.tsx` — show latency when connected
- `src/store/systemStore.ts` — add `reconnectCountdown` and `latencyMs` fields
- `src/hooks/useWebSocket.ts` — expose latency + countdown to store
- `src/test/components/widgets/ConnectionBadge.test.tsx` — add latency display tests
