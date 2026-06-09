# TASK-007: Export & Report Actions

## Status: DONE

## Problem
Multiple export/report buttons across panels have no handlers:
- CommandPanel: "⬇ Export PDF → BHQN" and "✍ Sign & Export PDF"
- CommandPanel: "↺ Resync" (CIBMS feed)
- CommandPanel: Shift Handover time range buttons (8h / 12h / 24h)

## Acceptance Criteria
- [ ] "Export PDF → BHQN" — uses `window.print()` with a print-only stylesheet
- [ ] "Sign & Export PDF" — same but prepends operator name + timestamp header
- [ ] "↺ Resync" — shows a brief "Resyncing…" spinner then "Synced" toast
- [ ] Shift Handover time range buttons update the active selection state
