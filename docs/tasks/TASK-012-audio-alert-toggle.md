# TASK-012: Audio Alert Toggle in Settings

**Status:** DONE
**Priority:** Medium

## Description
AlertPanel plays an 880 Hz beep for every incoming CRITICAL/HIGH alert. There is no way to silence it without closing the browser tab. Add an `audioAlertsEnabled` boolean to `settingsStore` and a toggle in the Settings panel (Display tab).

## Acceptance Criteria
- `settingsStore` gains `audioAlertsEnabled: boolean` (default `true`)
- `toggleAudioAlerts()` action flips it and persists to `sis-settings`
- AlertPanel calls `playBeep()` only when `audioAlertsEnabled` is true
- Settings panel Display tab renders the toggle with label "Audio Alerts"
- Unit tests for the new store action and AlertPanel's conditional beep

## Files to modify
- `src/store/settingsStore.ts`
- `src/components/panels/AlertPanel.tsx`
- `src/components/panels/SettingsPanel.tsx`
- `src/test/stores/settingsStore.test.ts`
- `src/test/components/panels/AlertPanel.test.tsx`
