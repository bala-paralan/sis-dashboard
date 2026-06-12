# TASK-004: Connect Panels to Zustand Stores with Demo-Mode Fallback

## Status: Completed

## Goal
Replace per-panel mock data generators (`useState` + `setInterval`) in CounterUASPanel and
PersonnelPanel with real Zustand store subscriptions. When the backend WebSocket is
disconnected, show a visible "DEMO MODE" banner and fall back to static demo data so the
UI remains usable during development/demonstrations.

## Scope
- `src/components/panels/CounterUASPanel.tsx` — use `sensorStore.tracks` for contact data
- `src/components/panels/PersonnelPanel.tsx` — use `alertStore.alerts` for personnel events
- New `src/components/widgets/DemoModeBanner.tsx` — reusable banner component

## Acceptance Criteria
- [x] CounterUASPanel reads live track data from `useSensorStore` when connected
- [x] CounterUASPanel shows demo contacts when `connectionStatus !== 'connected'`
- [x] PersonnelPanel reads sensor data from `useSensorStore` when available
- [x] `DemoModeBanner` is visible across panels when using mock data
- [x] All 273 existing tests still pass (323 tests total now passing)

## Implementation Notes
- `Track` type: `{ track_id, lat, lon, range_m, velocity, heading, class, confidence, age_frames }`
- Demo fallback: keep existing `useDroneContacts()` / `usePersonnel()` output as static arrays
- Store read: `const tracks = useSensorStore(s => s.tracks)`
- Connection check: `const status = useSystemStore(s => s.connectionStatus)`
