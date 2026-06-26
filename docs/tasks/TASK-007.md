# TASK-007: Production Build Verification & Performance Audit

## Status: TODO

## Description
Verify that `npm run build` produces a clean production bundle, identify any bundle size issues, and ensure the app loads correctly in production mode.

## Requirements
1. Run `npm run build` — must succeed with zero errors
2. Run `npm run preview` and verify dashboard loads
3. Check bundle size — warn if any chunk exceeds 500KB
4. Add dynamic imports for heavy panels (Leaflet map, video player) if needed
5. Ensure all environment variables are documented in `.env.example`

## Acceptance Criteria
- [ ] `npm run build` exits with code 0
- [ ] No TypeScript errors in production build
- [ ] Largest JS chunk ≤ 500KB gzipped (or split with dynamic import)
- [ ] `.env.example` documents all VITE_* variables used in the codebase
- [ ] All existing tests continue to pass
