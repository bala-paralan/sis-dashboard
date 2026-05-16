# TASK-006: Keyboard shortcuts for panel navigation

**Status**: DONE  
**Priority**: Medium

## Goal
Allow operators to quickly navigate panels using keyboard shortcuts without
touching the mouse, improving efficiency in time-critical situations.

## Acceptance criteria
- [ ] Global keyboard handler is registered once at App level
- [ ] Alt+1 … Alt+9 toggle-expand the first 9 panels in left-sidebar order
- [ ] Escape collapses any currently expanded panel back to normal view
- [ ] Alt+M mutes/unmutes audible alert beeps (toggle in systemStore)
- [ ] A `useKeyboardShortcuts` hook encapsulates all bindings
- [ ] Hook is unit-tested (key events fire correct store actions)
- [ ] On-screen shortcut legend is accessible via Alt+? (renders a modal)
- [ ] All prior tests remain green
