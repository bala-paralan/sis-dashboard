# TASK-007: Keyboard Shortcuts for Panel Navigation

**Status:** DONE  
**Priority:** Low  
**Estimated effort:** 2 hours

## Goal
Allow operators to navigate between panels and toggle common actions using keyboard
shortcuts without touching the mouse.

## Shortcuts to Implement
| Key | Action |
|-----|--------|
| `Alt+1` … `Alt+6` | Focus core panels (Map, Alerts, Video, Sensors, AI/ML, Health) |
| `Alt+S` | Open / close Settings |
| `Alt+C` | Open / close Camera Management |
| `Escape` | Collapse expanded panel back to grid |
| `?` (Shift+/) | Show keyboard shortcut help modal |

## Acceptance Criteria
- [x] `useKeyboardShortcuts` hook in `src/hooks/` wires up all shortcuts
- [x] Hook is registered once in `App.tsx`
- [x] Help modal (ShortcutsHelpModal) lists all shortcuts
- [x] Shortcuts do not fire when focus is inside a text input / textarea
- [x] Tests added for the hook (mocked KeyboardEvent)
