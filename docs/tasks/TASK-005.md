# TASK-005: Keyboard Navigation Shortcuts

## Status: DONE

## Description
Power operators need to navigate between panels quickly without using the mouse. Add a global keyboard shortcut system that allows switching panels via keyboard.

## Goals
- `useKeyboardShortcuts` hook that registers `Alt+<key>` shortcuts globally
- Shortcut map: Alt+1=map, Alt+2=alerts, Alt+3=video, Alt+4=sensors, Alt+5=ai-ml, Alt+6=health
- Shortcut help overlay toggled with `?` key (shows all shortcuts)
- Shortcuts listed in SettingsPanel

## Acceptance Criteria
- [x] `Alt+1` through `Alt+6` switch to the corresponding panel
- [x] `?` opens a floating shortcut-help overlay
- [x] Shortcuts are suppressed when the user is typing in an input/textarea
- [x] Help overlay closes on Escape or second `?` press
- [x] Unit tests for the hook
