# TASK-010: PTZ Controls — Visual Feedback

**Status**: COMPLETE  
**Priority**: MEDIUM  
**Estimated Effort**: Small

## Description
VideoPanel PTZ control buttons (TILT_UP, TILT_DOWN, PAN_LEFT, PAN_RIGHT, ZOOM_IN, ZOOM_OUT)
call `sendMessage()` which is a stub. Add visual feedback:
1. Highlight the active direction button with an active style while held down (mousedown/mouseup)
2. Show a small "PTZ ↑ sent" toast notification
3. Log PTZ commands to `sis_ptz_log` in localStorage

## Acceptance Criteria
- [ ] Active button visually highlighted during press
- [ ] Toast shows command sent
- [ ] Commands logged to localStorage
- [ ] All 273 tests still pass

## Files to Modify
- `src/components/panels/VideoPanel.tsx`
