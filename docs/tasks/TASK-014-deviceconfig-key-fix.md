# TASK-014: Fix DeviceConfigPage PinTable Missing Key Warning

**Status:** DONE
**Priority:** Low

## Description
DeviceConfigPage's `PinTable` component renders table rows inside an anonymous fragment (`<>`) inside a `.map()`, causing React's "Each child in a list should have a unique key prop" warning. The fragment needs a `key` so React can reconcile the face-group sections correctly.

## Acceptance Criteria
- No React key-prop warning in test output for DeviceConfigPage
- `<React.Fragment key={face}>` wraps each face group
- All existing DeviceConfigPage tests continue to pass

## Files modified
- `src/components/pages/DeviceConfigPage.tsx` — replace `<>` with `<React.Fragment key={face}>`
