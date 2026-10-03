# Module: sheet
**Role:** Lays the steps out on A4 pages (3 to 5 columns chosen for the largest cubes, 30 steps per page) and assembles one SVG document per page, from any starting cube and with an optional final-state cell.
**Files:** `src/layout.ts`, `src/sheet.ts`
**Exports:** `layoutSheet(moves, finalState?): PageLayout[]`, `renderSheet(moves, { start?, finalState? }): string[]`, `PAGE`, `COLUMNS`, `MAX_STEPS_PER_PAGE`
**Depends on:** `modules/drawing.md`, `modules/cube.md`
