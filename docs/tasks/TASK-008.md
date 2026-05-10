# TASK-008: TypeScript Strict Mode + Build Optimisation

**Status:** ⏳ PENDING

## Description
Enable TypeScript strict mode (`"strict": true`) across the project, fix all resulting type errors, and add build-time optimisations (chunk splitting, tree shaking analysis).

## Acceptance Criteria
- [ ] `tsconfig.json` has `"strict": true`
- [ ] Zero TypeScript errors after enabling strict mode
- [ ] `vite build` succeeds and produces chunks ≤ 500 kB each
- [ ] Recharts, Leaflet, HLS.js split into separate vendor chunks
- [ ] All 273+ tests still passing

## Estimated LOC
~50–100 lines changed (tsconfig + vite config + type fixes)
