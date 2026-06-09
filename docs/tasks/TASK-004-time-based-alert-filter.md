# TASK-004: Time-Based Alert Filtering

## Status: DONE

## Problem
`AlertFilter` type defines `timeRange: '1h' | '6h' | '24h' | 'ALL'` but it is not
implemented in `alertStore.ts` or `AlertPanel.tsx`. Operators cannot filter alerts by
recency, making it hard to triage recent incidents.

## Acceptance Criteria
- [ ] `alertStore.ts` — add `timeRange` field to `AlertFilter` interface (default `'ALL'`)
- [ ] `alertStore.ts` — `filteredAlerts()` filters by timestamp when `timeRange !== 'ALL'`
- [ ] `AlertPanel.tsx` — add a time-range selector (chips: 1h / 6h / 24h / ALL)
- [ ] All existing tests remain green
