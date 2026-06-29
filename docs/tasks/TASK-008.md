# TASK-008: PTZ camera control UI

**Status:** pending  
**Priority:** medium

## Description
The WebSocket layer already defines a `PTZ_CONTROL` message type but there is
no UI to send PTZ commands. Add a PTZ control overlay/panel in `VideoPanel`.

## Scope
- Add PTZ joystick / arrow-button controls to `VideoPanel.tsx`
- Wire up to WebSocket `sendMessage({ type: 'PTZ_CONTROL', ... })`
- Only show controls when the active feed is a PTZ camera

## Acceptance Criteria
- [ ] PTZ controls visible when PTZ feed is selected
- [ ] Sends correct WebSocket messages (pan, tilt, zoom)
- [ ] Test added for PTZ control interactions
