# TASK-012 — Dashboard Layout Presets

**Status:** COMPLETED

## Goal
Allow operators to save, load, export, and import named dashboard layout presets (panel visibility + widget config).

## Requirements
- `LayoutPreset` type: { name, createdAt, widgets: { [id]: { visible, updateRateHz, threshold } }, panels, defaultExpandedPanel }
- settingsStore additions: presets[], savePreset(name), loadPreset(name), deletePreset(name), exportPreset(name), importPreset(preset)
- Presets stored in localStorage at key `sis-dashboard-presets`; max 5
- New "Presets" tab in SettingsPanel:
  - Name input + Save button
  - Dropdown to load/delete saved presets
  - Export (downloads `.json`) and Import (reads `.json` file) buttons

## Changes
- `src/store/settingsStore.ts` — LayoutPreset type, presets[], savePreset/loadPreset/deletePreset/exportPreset/importPreset
- `src/components/panels/SettingsPanel.tsx` — new Presets tab with full save/load/delete/export/import UI

## Acceptance Criteria
- [x] SettingsPanel has Presets tab with save/load/delete/export/import
- [x] Saving a preset persists panel visibility + widget config to localStorage
- [x] Loading a preset restores the dashboard layout
- [x] Export downloads a valid `.json` preset file
- [x] Import reads a `.json` file and adds preset to the list
- [x] Max 5 presets enforced
- [x] All existing 435 tests still pass
