# TASK-007: Accessibility Improvements

**Status:** pending  
**Priority:** medium

## Description

The dashboard currently lacks ARIA labels, keyboard navigation, and other accessibility features. This task adds baseline WCAG 2.1 AA compliance.

## Work Items

- [ ] Add `aria-label` / `role` to all interactive buttons and controls
- [ ] Add `aria-live` regions for real-time alert updates
- [ ] Ensure focus management in modals (CameraFormModal, settings)
- [ ] Add keyboard navigation to sidebar (arrow keys, Enter/Space)
- [ ] Add `title` attributes to SVG charts and radar scope
- [ ] Add skip-to-main-content link in TopNavBar
- [ ] Verify color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Add tests for accessibility attributes in affected components

## Acceptance Criteria

- All interactive elements reachable by keyboard
- Screen-reader announcements for real-time updates
- No color-only information (status uses icons + color)
- No ARIA anti-patterns
