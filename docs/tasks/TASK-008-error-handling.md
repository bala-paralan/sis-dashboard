# TASK-008: Error Boundaries & Improved Error Handling

**Status:** pending  
**Priority:** medium

## Description

The application lacks React error boundaries — a single panel crash can take down the whole dashboard. This task adds error boundaries, better loading states, and user-facing error messages.

## Work Items

- [ ] Create `src/components/layout/PanelErrorBoundary.tsx` — wraps each panel, shows fallback UI on crash
- [ ] Wrap each panel in PanelGrid with PanelErrorBoundary
- [ ] Add toast notification system for API errors (camera CRUD, WS reconnect)
- [ ] Improve WebSocket disconnect UX — show banner with reconnect countdown
- [ ] Add empty-state placeholders (no alerts, no cameras, no sensors)
- [ ] Add `src/test/components/layout/PanelErrorBoundary.test.tsx`

## Acceptance Criteria

- A panel throwing an error shows a contained error card, not a blank screen
- API errors surface as dismissible toast messages
- WebSocket disconnection shows a banner with auto-reconnect status
- Empty states have informative messages and action prompts
