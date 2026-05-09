# TASK-006: Keyboard Shortcuts for Panel Navigation

## Status: DONE

## Summary
Power users need to navigate between panels and perform common actions without touching
the mouse. This task adds a global keyboard shortcut layer and a help overlay.

## Shortcut map
| Key | Action |
|-----|--------|
| M | Switch active panel to Map |
| A | Switch active panel to Alerts |
| V | Switch active panel to Video |
| S | Switch active panel to Sensors |
| I | Switch active panel to AI/ML |
| H | Switch active panel to Health |
| ? | Toggle keyboard shortcut help overlay |
| Esc | Close any open modal/overlay |

## Requirements
- Global `useKeyboardShortcuts` hook registered in App.tsx
- Shortcuts are disabled when focus is inside an `<input>`, `<textarea>`, or `[contenteditable]`
- Help overlay (`?`) shows the shortcut table styled with the dashboard theme
- Unit tests for the hook covering each shortcut and the input-focus guard

## Acceptance criteria
- All 6 panel shortcuts work in-browser
- Help overlay renders correctly
- Hook tests cover each key press scenario
- All existing 273 tests still pass
