# TASK-006: Sensor REST API Module

## Status: TODO

## Goal
Add a typed REST API module for sensor data so panels can fetch historical readings
and sensor catalogue from the backend (not just live WebSocket pushes).

## Deliverables
- `src/api/sensors.ts` — getSensors(), getSensorById(id), getSensorHistory(id, from, to)
- Types aligned with existing `SensorPayload` and `SensorFamily` from `src/types/sensors.ts`
- SensorFamilyPanel: add "Refresh" button that calls getSensors() as fallback when WS
  data is unavailable (degraded connectivity mode)
- Tests: mock API responses, store integration

## Acceptance Criteria
- Sensor REST calls use the same JWT-authenticated apiFetch client
- Graceful error handling (shows stale data indicator on failure)
- All existing 273 tests still pass; new tests added
