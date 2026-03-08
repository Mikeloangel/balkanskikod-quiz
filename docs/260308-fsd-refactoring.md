# FSD Refactoring Plan

## Goals
- Fix "Forbidden sidestep of public API" errors.
- Create `index.ts` files as public APIs for entities, pages, and shared segments.
- Refactor imports to use these public APIs.

## Public API Strategy
- Create `src/<layer>/<slice>/index.ts` for each slice.
- Export only necessary components, hooks, models, and types.
- Ensure all imports between slices and layers use these `index.ts` files.

## Files to Modify (Based on `steiger` output)
1. `src/entities/progress/index.ts` (create)
2. `src/pages/about/index.ts` (create)
3. `src/pages/home/index.ts` (create)
4. `src/pages/track/index.ts` (create)
5. `src/shared/config/index.ts` (create)
6. `src/shared/models/index.ts` (create)
7. Update imports in affected files (`src/app/App.tsx`, `src/entities/progress/model/stats.test.ts`, etc.)

## Step-by-Step
1. Create `index.ts` files for all reported slices/segments.
2. Update `src/entities/progress/index.ts` exports.
3. Update `src/pages/about/index.ts` exports.
4. Update `src/pages/home/index.ts` exports.
5. Update `src/pages/track/index.ts` exports.
6. Update `src/shared/config/index.ts` exports.
7. Update `src/shared/models/index.ts` exports.
8. Update all internal project imports to point to these new `index.ts` files.
9. Adjust path configuration if necessary:
   - Ensure `@` alias is defined in `tsconfig.paths.json`, `vite.config.ts`, and `vitest.config.ts`.
10. Run the build/tests to confirm no resolution errors.
11. Verify with `npm run lint:fsd`.

> После выполнения рефакторинга проект должен собираться (`npm run build`),
> проходить все unit-тесты и не выдавать ошибок `steiger`.
