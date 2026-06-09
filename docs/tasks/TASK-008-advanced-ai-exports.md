# TASK-008: Advanced AI Panel Exports & Recalibrate

## Status: DONE

## Problem
`AdvancedAIPanel.tsx` has three non-functional buttons:
- "Export PNG" on the behavioural heatmap
- "Export Audit CSV" on the model audit trail
- "Recalibrate" on a degraded LSTM model card

## Acceptance Criteria
- [ ] "Export PNG" — uses `html2canvas` or SVG serialisation to download the heatmap as PNG
- [ ] "Export Audit CSV" — downloads a CSV of displayed audit entries
- [ ] "Recalibrate" — shows a progress toast ("Recalibrating… 0%→100%") then marks model as CALIBRATING
