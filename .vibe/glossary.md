# Ubiquitous Language

## Move
One turn of a cube face in standard notation: a face letter (U, D, L, R, F, B), optionally followed by `2` for a half turn or `'` for a counter-clockwise turn.
_Sources: `src/moves.ts`_

## Move sequence
An ordered list of moves written as space-separated text. It is parsed strictly: the first invalid move stops the parsing and is reported with its position.
**Do not confuse with:** Move (a single turn).
_Sources: `src/moves.ts`, `src/messages.ts`_

## Step
One numbered entry of the sheet: the cube as it is before a move, the move's label (`#3 - F`) and an arrow showing the turn.
_Sources: `src/layout.ts`, `src/sheet.ts`_

## Sheet
The printable result: steps in a grid of three columns on A4 pages, at most 30 steps per page.
_Sources: `src/layout.ts`, `src/sheet.ts`_

## Layer
The slice of the cube that a move turns. The arrow of a step lies along its layer, on the visible edge when the layer is on a hidden face.
_Sources: `src/arrows.ts`_

## Half turn
A move written with `2`. Its step shows a red x2 marker next to the arrow.
_Sources: `src/arrows.ts`, `src/render.ts`_
