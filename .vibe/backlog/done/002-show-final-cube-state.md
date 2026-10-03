---
status: done
---
# Show Final Cube State

## Description
Let the user display the cube in its final state, after the last move of the sequence, so they can check the result of the whole sequence. Today each step only shows the cube before its move.

## Acceptance Criteria
- [ ] User can choose on the page to include the final state of the cube in the sheet.
- [ ] The preview and the PDF show one extra cube after the last step, with the state obtained after applying every move and no arrow.
- [ ] The final cube is clearly labeled as the final state, not as a numbered step.
- [ ] When the option is not chosen, the sheet is identical to the current one.

## Notes
Open question: the final cube takes a grid cell, so it may add a page when the sequence has exactly 30 steps (the current page limit). If the orientation choice (item 001) is implemented, the final cube must follow it.
