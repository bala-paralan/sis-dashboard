# TASK-005: Alert REST API + Persistent Alert Log

**Status:** IN PROGRESS (Session 3 — 2026-05-01)

## Description
The current `alertStore` is purely WebSocket-driven (in-memory, max 200 entries). Wire it to the backend REST API so alerts survive page reloads, support server-side pagination, bulk acknowledgement, and CSV export.

## Acceptance Criteria
- [ ] `src/api/alerts.ts` — typed REST wrappers: `fetchAlerts()` (paginated), `acknowledgeAlertApi()`, `bulkAcknowledgeAlerts()`, `dismissAlert()`, `fetchAlertsCsv()`
- [ ] `src/store/alertStore.ts` — enhanced with `loading`, `loadError`, pagination state, `loadAlerts()`, `bulkAcknowledgeAlerts()`, `dismissAlert()`, `exportAlerts()` actions; existing WS-driven `addAlert` / `acknowledgeAlert` / filter actions preserved
- [ ] `src/components/panels/AlertPanel.tsx` — adds "Load from server" auto-load on mount, bulk-select checkboxes + "Ack Selected" toolbar, "Export CSV" button, page prev/next controls
- [ ] `src/test/stores/alertStore.test.ts` — tests for all new store actions (loadAlerts success/error, bulkAck, dismiss, export, pagination)
- [ ] All existing 353 tests remain green; new tests bring total to ~390+

## Notes
Session 3 implementation.
