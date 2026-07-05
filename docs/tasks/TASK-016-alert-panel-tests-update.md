# TASK-016: Update AlertPanel Tests for Audio Toggle

**Status:** DONE
**Priority:** Low

## Description
The AlertPanel was modified in TASK-012 to gate `playBeep()` behind `settingsStore.audioAlertsEnabled`. The existing AlertPanel tests do not cover this new behaviour.

## Acceptance Criteria
- Test verifies `playBeep` is NOT called when `audioAlertsEnabled` is false
- Test verifies `playBeep` IS called when `audioAlertsEnabled` is true and a new CRITICAL/HIGH alert arrives
- All existing AlertPanel tests continue to pass

## Files to modify
- `src/test/components/panels/AlertPanel.test.tsx`
