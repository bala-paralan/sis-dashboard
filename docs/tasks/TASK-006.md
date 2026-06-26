# TASK-006: Operator Notes Widget

## Status: DONE

## Description
The settings store lists `operatorNotes` widget as visible but there is no implementation. Operators need to annotate the current shift with free-text notes that persist across page refreshes.

## Requirements
1. Create `src/components/widgets/OperatorNotes.tsx` — textarea with auto-save to localStorage (debounced 500ms), character counter (max 2000), timestamps on save, clear button with confirm dialog
2. Render the widget inside AlertPanel when `isWidgetVisible('operatorNotes')` is true
3. Notes key in localStorage: `sis-operator-notes`
4. Display last-saved timestamp below the textarea

## Acceptance Criteria
- [x] Operator Notes textarea visible in AlertPanel (respects `operatorNotes` widget visibility)
- [x] Text persists after page refresh (localStorage key: sis-operator-notes)
- [x] "Saved HH:MM:SS" updates on auto-save (500ms debounce)
- [x] Clear button shows "Confirm?" before erasing (two-click safety)
- [x] Character count shows remaining characters (max 2000)
- [x] All existing tests continue to pass (273/273)
