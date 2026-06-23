// Vitest runs in jsdom which exposes Node.js `global` as an alias for globalThis.
// This declaration lets TypeScript accept `global.X = ...` assignments in test files.
declare const global: typeof globalThis
