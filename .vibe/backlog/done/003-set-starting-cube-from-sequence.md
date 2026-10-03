---
status: done
---
# Set Starting Cube From Sequence

## Description
Let the user describe the starting cube with a move sequence applied to a solved cube (for example a scramble), instead of always starting from a solved cube. The solving steps are then drawn from that scrambled state.

## Acceptance Criteria
- [ ] User can enter an optional starting sequence in a separate field on the page, using the same move notation as the main sequence.
- [ ] The first cube of the sheet (preview and PDF) shows the state obtained by applying the starting sequence to a solved cube, and every following step starts from there.
- [ ] An invalid starting sequence shows an error message naming the faulty move, and no sheet is generated.
- [ ] When the starting sequence is empty, the sheet is identical to the current one.

## Notes
The starting sequence itself is not drawn as steps. Related to item 001 (starting orientation): if both are implemented, the orientation applies first, then the starting sequence. Reuse the strict parsing of `moves.ts` and its error wording.
