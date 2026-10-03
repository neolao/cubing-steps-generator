---
status: done
---
# Choose Starting Orientation

## Description
Let the user choose how the cube is held at the start of the sequence (which color is on top and which faces the front), instead of the single fixed orientation. The moves (`F`, `U`, `R`…) then apply to the cube in the chosen orientation.

## Acceptance Criteria
- [ ] User can pick the starting orientation (top and front colors) on the page before generating the sheet.
- [ ] The preview and the PDF show the first cube, and every following step, in the chosen orientation.
- [ ] Moves are applied relative to the chosen orientation (e.g. `F` turns the face currently in front).
- [ ] When no choice is made, the sheet is identical to the current one (default orientation).

## Notes
Open question: whether the choice is limited to the 24 valid orientations (top color + front color) or only to the top color. Invalid combinations (e.g. same color or opposite colors for top and front) must be impossible to select.
