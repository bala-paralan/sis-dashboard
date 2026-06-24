# TASK-006: TypeScript Strict Mode & Type Cleanup

## Status
PENDING → IN_PROGRESS → DONE

## Goal
Enable `strict: true` in tsconfig.json (and tsconfig.node.json) and resolve all
resulting errors so the project compiles cleanly under strict TypeScript.

## Scope
- Set `"strict": true` in `tsconfig.json` compilerOptions
- Fix any resulting type errors across `src/` (implicit any, unchecked index access, etc.)
- `npm run build` must succeed with no TypeScript errors

## Acceptance
`npm run build` exits 0 with no type errors.
`npm run test:frontend` still all green.
