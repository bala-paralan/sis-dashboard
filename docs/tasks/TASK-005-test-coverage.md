# TASK-005: Add Tests for Untested Panels

**Status:** DONE  
**Priority:** Medium  
**Estimated effort:** 3–4 hours

## Goal
Every panel component should have a corresponding test file with at least 3 meaningful
tests (render, data display, interaction).

## Panels Missing Tests
- [ ] CounterUASPanel
- [ ] PowerPanel
- [ ] PersonnelPanel
- [ ] CommandPanel
- [ ] WeatherPanel
- [ ] AdvancedAIPanel
- [ ] SettingsPanel
- [ ] CameraGrid (partial — add more coverage)

## Acceptance Criteria
- [ ] Each panel above has a `.test.tsx` file under `src/test/components/panels/`
- [ ] Tests verify: component renders without error, key UI elements present,
      mock store interactions work
- [ ] All 273+ existing tests continue to pass

## Implementation Notes
- Use existing test helpers in `src/test/setup.tsx`
- Mock Zustand stores with `vi.mock`
- Keep tests fast — no real timers, mock `setInterval` / `Math.random` where used
