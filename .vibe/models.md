# Data models

## Move
| Field | Type | Notes |
|---|---|---|
| face | `U` `D` `L` `R` `F` `B` `M` `E` `S` | Layer turned (a face, or a middle layer; typed `Layer` in the code) |
| turns | number | -1 counter-clockwise, 1 clockwise, 2 or 3 clockwise repeated that many times |
| notation | string | As typed, e.g. `U'` |
Defined in: `src/moves.ts`

## Translation
| Field | Type | Notes |
|---|---|---|
| htmlLang | string | Language tag of the page, e.g. `zh-Hans` |
| nativeName | string | Name shown in the language selector |
| ui | texts and functions | Every text of the page; parametrised texts and plurals are functions returning a whole sentence |
| errors | functions | The three move error sentences; the faulty move is quoted verbatim |
| page | texts | Title, description, h1, notation text and three FAQ entries of the language page |
One per language, a missing key fails the type check. Registered in `LANGUAGES` with the page path (`""`, `fr/`, `es/`, `it/`, `zh/`, `ja/`, `ko/`).
Defined in: `src/i18n/types.ts`, `src/i18n/index.ts`

## Orientation
| Field | Type | Notes |
|---|---|---|
| top | Color | Color of the top face; default yellow |
| front | Color | Color of the front face, never the top color or its opposite; default green |
The right face color is top x front. 24 valid orientations.
Defined in: `src/cube.ts`

## SequenceError
| Field | Type | Notes |
|---|---|---|
| kind | `unknown-face` `bad-suffix` | Why the move was rejected |
| token | string | The rejected text |
| position | number | 1-based position in the sequence |
Defined in: `src/moves.ts`

## CubeState
54 colors in the order of faces U, R, F, D, L, B, 9 stickers each, read row by row. Solved by default: yellow top, orange right, green front, white bottom, red left, blue back (other orientations: see Orientation).
Defined in: `src/cube.ts`

## ArrowSpec
| Field | Type | Notes |
|---|---|---|
| surface | `F` `R` | Visible face the arrow lies on |
| axis | `x` `y` | Direction of travel |
| line | `-1` `1` | Moved layer across the axis |
| sign | `-1` `1` | Towards the negative or positive end |
| repeat | number | 2 or more adds the xN marker |
Defined in: `src/arrows.ts`

## StepPlacement
Position, label, font size and cube scale of one step on a page. Its move is null for the final-state cell.
Defined in: `src/layout.ts`
