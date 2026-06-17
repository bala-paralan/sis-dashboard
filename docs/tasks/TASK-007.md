# TASK-007: Sensor Text Search

## Status: DONE

## Description
The SensorFamilyPanel displays sensors by family but has no text search. Add a live search input that filters sensors by ID or description across all families.

## Goals
- Search input at the top of `SensorFamilyPanel`
- Filters sensor cards in real time as the user types (case-insensitive match on `sensor_id` and `location`)
- "No results" empty state when nothing matches
- Clears on Escape key
- Unit test for the filtering logic

## Acceptance Criteria
- [x] Search input is visible at the top of the sensor panel
- [x] Typing filters cards in real time
- [x] Match is case-insensitive, works on sensor ID and site ID fields
- [x] Empty state shown when no sensors match ("No results for…")
- [x] Escape clears the search input
- [x] Filtering logic covered via SensorFamilyPanel tests
