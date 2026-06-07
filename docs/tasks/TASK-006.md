# TASK-006: Geofence Zone Editor

## Status: DONE

## Description
Allow operators to draw and manage geofence zones directly on the Tactical Map. Currently the Personnel & NavIC panel tracks personnel vs zones but zones cannot be created/edited.

## Requirements
- "Draw Zone" button on Tactical Map toolbar
- Click-to-add polygon vertices on the Leaflet map
- Zone name, type (exclusion/inclusion/alert), color selection
- Save zone to Zustand store (persisted in localStorage)
- Delete zone capability
- Show zone overlays on Tactical Map

## Acceptance Criteria
- [ ] Operator can draw a polygon zone on the map
- [ ] Zone appears as colored overlay on the map
- [ ] Zone data persists across page reload (localStorage)
- [ ] Zones visible in Personnel & NavIC panel for geofence logic
- [ ] Tests pass
