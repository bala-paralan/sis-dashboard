# TASK-006: SettingsPanel & DeviceConfigPage Tests

## Status: DONE

## Summary
Two of the most complex pages — SettingsPanel and DeviceConfigPage — have zero test
coverage. This task adds tests that exercise their tabs, interactions, and store
integration.

## Acceptance Criteria
- [ ] `src/test/components/panels/SettingsPanel.test.tsx`
  - Renders all 5 tabs (Widgets, Panels, Display, Layout, Thresholds)
  - Toggle widget on/off updates settingsStore
  - Toggle panel visibility updates settingsStore
  - Theme toggle calls systemStore.toggleTheme
  - Reset to defaults calls settingsStore.resetToDefaults
- [ ] `src/test/components/pages/DeviceConfigPage.test.tsx`
  - Renders all 4 tabs (Overview, Port Configuration, Data & Periodicity, Deployment Topology)
  - Port list renders correct sensor labels
  - Tab switching works
- [ ] All existing 273 tests continue to pass

## Notes
- Mock all stores (`vi.mock('@/store/settingsStore')`, etc.) following existing patterns.
- DeviceConfigPage relies on `useSensorStore` — provide mock sensor data.
