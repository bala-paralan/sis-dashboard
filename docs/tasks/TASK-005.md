# TASK-005: Audio alert notifications for critical events

## Status: pending

## Description
Play audio tones when high/critical alerts arrive over WebSocket. Provide a mute toggle in the TopNavBar. Alert sounds should be generated via the Web Audio API (no external audio files needed).

## Acceptance Criteria
- [ ] Critical alerts trigger a distinct repeating beep via Web Audio API
- [ ] High-severity alerts trigger a single alert tone
- [ ] Mute/unmute toggle button in TopNavBar persists across page reloads (localStorage)
- [ ] Audio only plays when the browser tab is in focus
- [ ] No external audio file dependencies

## Depends on
TASK-002
