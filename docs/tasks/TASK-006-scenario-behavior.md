# TASK-006: Scenario-Driven Panel Behavior

## Status: PENDING

## Scope
When the operator selects a scenario via the TopNavBar ScenarioSelector, the panels
should react accordingly:

| Scenario        | Effect |
|-----------------|--------|
| PEACETIME       | Alert thresholds relaxed, map zones green, AI confidence threshold raised to 85% |
| HEIGHTENED      | Medium alerts promoted visually, map zones amber, camera PTZ rate increased |
| EXERCISE        | All panels show "EXERCISE MODE" banner, simulated alert injection rate 2×  |
| LOCKDOWN        | CRITICAL-only alert filter forced, all personnel shown on map, camera 1×1 locked |

## Approach
- Add `scenarioConfig` derived from `useSystemStore(s => s.scenario)` in each affected panel
- Each panel reads scenario from the store and adjusts its rendering accordingly
- No new stores needed – scenario already exists in systemStore

## Acceptance Criteria
- [ ] Each scenario applies distinct visual/behavioral changes across at least 3 panels
- [ ] EXERCISE mode shows a banner in every panel header
- [ ] Scenario changes take effect within one render cycle
- [ ] All 273 existing tests remain green
