# Ubiquitous Language

## Move
One turn of a cube face in standard notation: a face letter (U, D, L, R, F, B), optionally followed by `'` for a counter-clockwise turn or a repeat count (`2` or `3`).
_Sources: `src/moves.ts`_

## Move sequence
An ordered list of moves written as space-separated text. It is parsed strictly: the first invalid move stops the parsing and is reported with its position.
**Do not confuse with:** Move (a single turn).
_Sources: `src/moves.ts`, `src/messages.ts`_

## Step
One numbered entry of the sheet: the cube as it is before a move, the move's label (`#3 - F`) and an arrow showing the turn.
_Sources: `src/layout.ts`, `src/sheet.ts`_

## Sheet
The printable result: steps in a grid of three to five columns on A4 pages, at most 30 steps per page.
_Sources: `src/layout.ts`, `src/sheet.ts`_

## Layer
The slice of the cube that a move turns. The arrow of a step lies along its layer, on the visible edge when the layer is on a hidden face.
_Sources: `src/arrows.ts`_

## Repeated move
A move written with a count of 2 or 3 (`L2`, `L3`): the face is turned clockwise that many times. Its step shows a red xN marker next to the arrow.
_Sources: `src/arrows.ts`, `src/render.ts`_

## Orientation
How the cube is held at the start: the colors of its top and front faces (24 valid pairs, never the same or opposite colors). Default: yellow top, green front.
_Sources: `src/cube.ts`_

## Starting sequence
Optional moves applied to the solved cube, in the chosen orientation, before step 1. They are not drawn as steps.
**Do not confuse with:** Move sequence (the steps drawn on the sheet).
_Sources: `src/app.ts`_

## Final state
An extra cube after the last step, labelled "Final state", with no arrow and no number; it is not counted as a step.
_Sources: `src/layout.ts`, `src/sheet.ts`_
