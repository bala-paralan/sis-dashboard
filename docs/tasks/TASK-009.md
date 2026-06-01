# TASK-009: Sensor & Alert REST API Modules

## Status: COMPLETED

## Goal
Add REST API modules for sensors, alerts, and system health — parallel to
the existing cameras and auth APIs. These allow components to hydrate from
the server on initial load rather than waiting for WebSocket pushes.

## Scope
- `src/api/sensors.ts`  — fetchSensors, fetchSensor, acknowledgeSensor
- `src/api/alerts.ts`   — fetchAlerts, fetchAlert, acknowledgeAlert, dismissAlert
- `src/api/system.ts`   — fetchSystemHealth, fetchScenario, setScenario
- `src/test/api/sensors.test.ts`
- `src/test/api/alerts.test.ts`
- `src/test/api/system.test.ts`

## Acceptance Criteria
- [x] All three API modules compile with zero TS errors
- [x] 32 new tests across the three test files, all passing
- [x] Existing 525 tests continue to pass (557 total)
