# TASK-007: Fix Build Chunk Size Warning — Split hls.js

## Status
PENDING → IN_PROGRESS → DONE

## Goal
The CameraGrid bundle includes hls.js (~500 kB) in a single chunk, triggering
Vite's 500 kB warning.  Split hls.js into its own vendor chunk so the warning
disappears and the browser can cache the library independently of app code.

## Scope
- Add `build.rollupOptions.output.manualChunks` to `vite.config.ts`
- Put `hls.js` in a `vendor-hls` chunk
- Put React + React DOM in a `vendor-react` chunk
- `npm run build` must exit 0 with no chunk-size warning

## Acceptance
`npm run build` exits 0 and outputs no "chunk larger than 500 kB" warning.
