# TASK-007: Interactive Geofence Zone Management

## Status: PENDING

## Scope
Currently the LiveMapPanel has two hardcoded alert zones (Zone A / Zone B) centered on
fixed coordinates. This task adds a Geofence Management UI:

1. A "Manage Zones" button in the LiveMapPanel header area
2. A slide-out panel listing current zones with edit/delete
3. An "Add Zone" form (name, lat, lon, radius_m, threat level)
4. Zones stored in a new lightweight `geofenceStore` (persisted to localStorage)
5. Zones rendered on the Leaflet map as Circle overlays

## Approach
- New store: `src/store/geofenceStore.ts` (zustand + localStorage persist)
- New component: `src/components/map/GeofenceManager.tsx`
- Update `LiveMapPanel.tsx` to use store zones instead of hardcoded ones

## Acceptance Criteria
- [ ] Operator can add/edit/delete zones without a page reload
- [ ] Zones persist across browser refreshes (localStorage)
- [ ] Zones render on the Leaflet map with correct radius and threat-level color
- [ ] At least 5 tests for the geofenceStore
- [ ] All 273 existing tests remain green
