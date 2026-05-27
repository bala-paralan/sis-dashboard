# TASK-008: WebSocket Outbound Message Queue

**Status:** DONE  
**Priority:** Medium  
**Estimated effort:** 2 hours

## Goal
Messages sent via `sendMessage` while the WebSocket is disconnected are silently
dropped today.  Queue them and flush automatically on reconnect.

## Acceptance Criteria
- [ ] `useWebSocket` maintains an internal queue (`pendingMessages: string[]`)
- [ ] `sendMessage` pushes to the queue when `ws.readyState !== OPEN`
- [ ] On every successful open/reconnect, the queue is drained in order
- [ ] Queue is capped at 50 messages (oldest dropped beyond cap) to avoid unbounded growth
- [ ] Existing `useWebSocket` tests continue to pass
- [ ] New tests cover: queue-on-disconnect, drain-on-reconnect, cap enforcement

## Implementation Notes
- Keep the queue inside the hook (ref, not state — no re-renders)
- Draining should happen in the `ws.onopen` handler after the SUBSCRIBE message
