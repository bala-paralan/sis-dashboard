# TASK-002 — Test Coverage for Newer Panels

**Status:** 🔄 IN PROGRESS (this session)

## Description

The initial test suite covered only the 6 core panels (AIMLPanel, AlertPanel, LiveMapPanel, SensorFamilyPanel, SystemHealthPanel, VideoPanel).  Six newer panels added after the initial release have zero test coverage.  This task adds comprehensive Vitest/RTL test files for all of them, plus SettingsPanel.

## Panels to Cover

| Panel | Test file | Status |
|-------|-----------|--------|
| CounterUASPanel | `src/test/components/panels/CounterUASPanel.test.tsx` | 🔄 |
| PersonnelPanel | `src/test/components/panels/PersonnelPanel.test.tsx` | 🔄 |
| PowerPanel | `src/test/components/panels/PowerPanel.test.tsx` | 🔄 |
| CommandPanel | `src/test/components/panels/CommandPanel.test.tsx` | 🔄 |
| AdvancedAIPanel | `src/test/components/panels/AdvancedAIPanel.test.tsx` | 🔄 |
| WeatherPanel | `src/test/components/panels/WeatherPanel.test.tsx` | 🔄 |
| SettingsPanel | `src/test/components/panels/SettingsPanel.test.tsx` | 🔄 |

## Acceptance Criteria

- [ ] All 7 new test files created
- [ ] Each panel has ≥ 7 meaningful tests
- [ ] Full suite stays green (no regressions)
- [ ] Total test count rises from 273 to ≥ 322
