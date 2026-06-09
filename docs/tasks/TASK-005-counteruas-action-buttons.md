# TASK-005: Counter-UAS Action Buttons

## Status: DONE

## Problem
"⚡ Engage QRT", "📝 Log Engagement", "⚡ Notify QRT", and "⬇ Export KML" buttons
in `CounterUASPanel.tsx` have no click handlers. Operators cannot respond to or
document UAS contacts.

## Acceptance Criteria
- [ ] "Notify QRT" — shows a toast notification with contact summary
- [ ] "Engage QRT" — opens a confirmation dialog before dispatching
- [ ] "Log Engagement" — appends a timestamped entry to a local log list, shown in panel
- [ ] "Export KML" — downloads a KML file of the track history points
