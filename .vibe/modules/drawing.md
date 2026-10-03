# Module: drawing
**Role:** Decides where each move's arrow goes and draws one cube in isometric SVG, with arrow and repeat marker.
**Files:** `src/arrows.ts`, `src/render.ts`
**Exports:** `arrowFor(move): ArrowSpec`, `buildScene(state, move): CubeScene`, `buildFinalScene(state): StateScene`, `sceneToSvg(scene, idPrefix): string`, `project(point)`, `CUBE_BOUNDS`
**Depends on:** `modules/cube.md`, `modules/moves.md`
