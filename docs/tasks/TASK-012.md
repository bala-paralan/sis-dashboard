# TASK-012 — Dashboard Layout Presets

**Status:** COMPLETED

## Goal
Allow operators to save and restore named dashboard layout presets (visible widgets + panel order) from the Settings panel.

## Requirements
- Save current layout as a named preset
- Load preset (restores all widget visibility and panel settings)
- Delete preset
- Export preset as JSON file
- Import preset from JSON file
- Max 5 presets stored in localStorage (`sis-dashboard-presets` key)
- Presets tab in SettingsPanel

## Changes
- `src/store/settingsStore.ts` — `LayoutPreset` interface, `savePreset`, `loadPreset`, `deletePreset`, `exportPreset`, `importPreset`
- `src/components/panels/SettingsPanel.tsx` — Presets tab with save/load/delete/import/export UI

## Acceptance Criteria
- [x] Presets tab visible in SettingsPanel
- [x] Can save current layout with a custom name
- [x] Can load a saved preset (restores widget visibility)
- [x] Can delete a preset
- [x] Can export preset as downloadable JSON
- [x] Can import preset from JSON file
- [x] Max 5 presets enforced
- [x] Presets persisted to localStorage
- [x] All existing tests still pass
