import type { Face, Move } from "./moves";

/**
 * Where the arrow of a move is drawn on the isometric cube (front and right faces
 * are visible, as are the top face's stickers but arrows never lie on it).
 * Moves of hidden faces are drawn on the visible edge of the layer they turn.
 */
export interface ArrowSpec {
	surface: "F" | "R";
	/** Cube axis the arrow travels along: x = left to right, y = bottom to top. */
	axis: "x" | "y";
	/** Cubie coordinate (-1 or 1) of the moved layer across the arrow's axis. */
	line: -1 | 1;
	/** 1 = towards the positive end of the axis, -1 = towards the negative end. */
	sign: 1 | -1;
	/** Half turn: the sheet adds a "x2" marker. */
	half: boolean;
}

/** Arrow of a clockwise quarter turn of each face. */
const CLOCKWISE_ARROW: Record<Face, Omit<ArrowSpec, "half">> = {
	U: { surface: "F", axis: "x", line: 1, sign: -1 },
	D: { surface: "F", axis: "x", line: -1, sign: 1 },
	L: { surface: "F", axis: "y", line: -1, sign: -1 },
	R: { surface: "F", axis: "y", line: 1, sign: 1 },
	F: { surface: "R", axis: "y", line: 1, sign: -1 },
	B: { surface: "R", axis: "y", line: -1, sign: 1 },
};

export function arrowFor(move: Move): ArrowSpec {
	const clockwise = CLOCKWISE_ARROW[move.face];
	return {
		...clockwise,
		sign: move.turns === -1 ? (-clockwise.sign as 1 | -1) : clockwise.sign,
		half: move.turns === 2,
	};
}
