# TASK-008: Incident Playback Timeline

## Status: TODO

## Description
Add a timeline/scrubbing UI that replays recorded alert and sensor events. Events accumulate in a circular buffer in Zustand during the session.

## Requirements
- Timeline bar at the bottom of the dashboard (collapsible)
- Playback controls: play, pause, speed (0.5x/1x/2x/5x), seek
- Events: alerts, sensor state changes, track appearances
- Scrubbing updates the main dashboard state to the historical snapshot
- "Live" button to jump back to real-time

## Acceptance Criteria
- [ ] Timeline shows events from current session
- [ ] Playback replays events in order at selected speed
- [ ] Seeking to a timestamp restores dashboard state
- [ ] "Live" mode resumes real-time updates
- [ ] Tests pass
