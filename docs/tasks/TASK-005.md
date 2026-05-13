# TASK-005 — WebSocket Heartbeat + Message Throttling

**Status**: PENDING

## Objective
Improve connection reliability and reduce unnecessary re-renders by adding:
1. **Heartbeat ping/pong** — detect stale connections before reconnect timeout fires
2. **Message throttling** — coalesce high-frequency sensor updates to cap render rate

## Background
`useWebSocket.ts` has exponential backoff reconnection but no active heartbeat.
On flaky networks the connection appears open but messages stop flowing, and the
dashboard shows stale data without triggering a reconnect.

High-frequency sensor messages (500 Hz seismic, 1 kHz vibration) can cause
excessive React re-renders.

## Acceptance Criteria
- [ ] WebSocket sends a JSON `{"type":"PING"}` every 15 seconds
- [ ] If no `PONG` received within 5 seconds of a PING, force-reconnect
- [ ] Incoming `SENSOR_DATA` messages are coalesced: store batched at ≤ 10 Hz (100ms)
- [ ] Heartbeat timer is cleared on unmount / connection close
- [ ] All existing tests continue to pass

## Implementation Notes
- Add `pingTimerRef` and `pongTimeoutRef` refs to `useWebSocket`
- Batch updates using `requestAnimationFrame` or `setTimeout(0)` accumulator
- Throttle only `SENSOR_DATA` type; all other message types remain immediate
