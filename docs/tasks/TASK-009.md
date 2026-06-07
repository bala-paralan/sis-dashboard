# TASK-009: Dashboard Analytics & Performance Metrics Panel

## Status: TODO

## Description
Add a diagnostics panel showing dashboard FPS, WebSocket latency, event throughput, and alert statistics for the current session.

## Requirements
- New collapsible diagnostics bar (or extend System Health panel)
- Metrics: render FPS, WS round-trip latency (ping/pong), events/sec, alert rate
- Session stats: total alerts, acknowledged %, average response time
- Sparkline charts for each metric (last 60 data points)
- Auto-refresh every second

## Acceptance Criteria
- [ ] FPS counter updates in real time
- [ ] WS latency shown with min/max/avg
- [ ] Alert statistics accurate for current session
- [ ] Sparkline charts render without lag
- [ ] Tests pass
