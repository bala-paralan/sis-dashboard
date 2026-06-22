# TASK-007: Custom Alert Rules Builder

## Status: TODO

## Description
Add a rules configuration screen where operators can define conditions that trigger alerts (e.g., "if sensor quality < 30% for 10s, create HIGH alert").

## Requirements
- New tab in Dashboard Settings: "Alert Rules"
- Rule builder form: condition (field, operator, value), severity, message template
- Enable/disable individual rules
- Rules stored in Zustand settingsStore + localStorage
- Evaluate rules in alertStore whenever sensor data updates

## Acceptance Criteria
- [ ] Operator can create a custom alert rule
- [ ] Rule triggers correctly when condition is met
- [ ] Rules persist across reload
- [ ] Rules can be toggled on/off
- [ ] Tests pass
