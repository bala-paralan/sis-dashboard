# TASK-010: Satellite & Terrain Imagery Overlay

## Status: DONE

## Description
Enable the satellite imagery and terrain overlay widgets that are currently declared but hidden (visibility: false). Integrate a tile layer switcher on the Tactical Map.

## Requirements
- Map layer switcher: Standard, Satellite, Terrain, Hybrid
- Use OpenStreetMap for standard, Esri WorldImagery for satellite, OpenTopoMap for terrain
- Layer switcher control in top-right of map
- Remember selected layer in localStorage
- Overlay toggles for grid, compass rose, scale bar

## Acceptance Criteria
- [ ] Layer switcher renders on Tactical Map
- [ ] Each layer loads correctly without API key (OSM/Esri free tiers)
- [ ] Layer preference persists across reload
- [ ] Overlay toggles work correctly
- [ ] Tests pass
