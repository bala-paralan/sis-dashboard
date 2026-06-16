# TASK-002 — Test Coverage for Newer Panels

**Status:** ✅ DONE  
**Commit:** `a02957b`

## Description

The initial test suite covered only the 6 core panels (AIMLPanel, AlertPanel, LiveMapPanel, SensorFamilyPanel, SystemHealthPanel, VideoPanel).  Six newer panels added after the initial release have zero test coverage.  This task adds comprehensive Vitest/RTL test files for all of them, plus SettingsPanel.

## Panels to Cover

| Panel | Test file | Status |
|-------|-----------|--------|
| CounterUASPanel | `src/test/components/panels/CounterUASPanel.test.tsx` | ✅ 10 tests |
| PersonnelPanel | `src/test/components/panels/PersonnelPanel.test.tsx` | ✅ 9 tests |
| PowerPanel | `src/test/components/panels/PowerPanel.test.tsx` | ✅ 9 tests |
| CommandPanel | `src/test/components/panels/CommandPanel.test.tsx` | ✅ 10 tests |
| AdvancedAIPanel | `src/test/components/panels/AdvancedAIPanel.test.tsx` | ✅ 10 tests |
| WeatherPanel | `src/test/components/panels/WeatherPanel.test.tsx` | ✅ 10 tests |
| SettingsPanel | `src/test/components/panels/SettingsPanel.test.tsx` | ✅ 10 tests |

## Acceptance Criteria

- [x] All 7 new test files created
- [x] Each panel has ≥ 7 meaningful tests (68 tests added)
- [x] Full suite stays green (no regressions)
- [x] Total test count rose from 273 to 341
