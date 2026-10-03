# Data models

## Move
| Field | Type | Notes |
|---|---|---|
| face | `U` `D` `L` `R` `F` `B` | Face turned |
| turns | `1` `-1` `2` | Clockwise, counter-clockwise, half turn |
| notation | string | As typed, e.g. `U'` |
Defined in: `src/moves.ts`

## SequenceError
| Field | Type | Notes |
|---|---|---|
| kind | `unknown-face` `bad-suffix` | Why the move was rejected |
| token | string | The rejected text |
| position | number | 1-based position in the sequence |
Defined in: `src/moves.ts`

## CubeState
54 colors in the order of faces U, R, F, D, L, B, 9 stickers each, read row by row. Solved: yellow top, orange right, green front, white bottom, red left, blue back.
Defined in: `src/cube.ts`

## ArrowSpec
| Field | Type | Notes |
|---|---|---|
| surface | `F` `R` | Visible face the arrow lies on |
| axis | `x` `y` | Direction of travel |
| line | `-1` `1` | Moved layer across the axis |
| sign | `-1` `1` | Towards the negative or positive end |
| half | boolean | Adds the x2 marker |
Defined in: `src/arrows.ts`

## StepPlacement
Position, label, font size and cube scale of one step on a page.
Defined in: `src/layout.ts`
