# TASK-008: Dashboard Configuration Persistence

## Status: DONE

## Goal
Allow operators to save and restore their dashboard layout (which panels are visible, panel order, widget preferences) as named presets.

## Requirements
- "Save Layout" button in SettingsPanel — saves current panel visibility + widget config as named preset
- "Load Layout" dropdown — list saved presets, apply on selection
- "Reset to Default" option
- Presets stored in localStorage (key: `sis-dashboard-presets`)
- Up to 5 named presets per user
- Export preset as JSON file / Import preset from JSON file

## Acceptance Criteria
- [x] SettingsPanel has Save Layout button with name input
- [x] Saved presets appear in Load Layout dropdown
- [x] Loading a preset restores panel and widget visibility
- [x] Reset to Default restores factory settings
- [x] Export downloads preset as `.json` file
- [x] Import reads `.json` file and adds it to presets
- [x] All existing tests still pass
