import { describe, expect, it } from "vitest";
import { type ArrowSpec, arrowFor } from "../src/arrows";
import { FACES, type Move, parseSequence } from "../src/moves";

function move(notation: string): Move {
	const parsed = parseSequence(notation);
	if (!parsed.ok || parsed.moves.length !== 1) {
		throw new Error(`bad test move ${notation}`);
	}
	return parsed.moves[0] as Move;
}

// Layout read from the reference sheet (steps 1-15): every arrow is drawn on the
// front face (F) or the right face (R) of the isometric cube, on the moved layer.
//   U / D  -> top / bottom row of the front face, travelling left / right
//   L / R  -> left / right column of the front face, travelling down / up
//   F / B  -> front / back column of the right face, travelling down / up
const CLOCKWISE: Record<string, Omit<ArrowSpec, "half">> = {
	U: { surface: "F", axis: "x", line: 1, sign: -1 },
	D: { surface: "F", axis: "x", line: -1, sign: 1 },
	L: { surface: "F", axis: "y", line: -1, sign: -1 },
	R: { surface: "F", axis: "y", line: 1, sign: 1 },
	F: { surface: "R", axis: "y", line: 1, sign: -1 },
	B: { surface: "R", axis: "y", line: -1, sign: 1 },
};

describe("arrowFor", () => {
	it.each(Object.entries(CLOCKWISE))(
		"places the %s arrow on its layer",
		(face, expected) => {
			expect(arrowFor(move(face))).toEqual({ ...expected, half: false });
		},
	);

	it.each(Object.entries(CLOCKWISE))(
		"reverses the %s' arrow along the same line",
		(face, expected) => {
			expect(arrowFor(move(`${face}'`))).toEqual({
				...expected,
				sign: -expected.sign,
				half: false,
			});
		},
	);

	it.each(Object.entries(CLOCKWISE))(
		"keeps the %s2 arrow like a clockwise turn, marked as half",
		(face, expected) => {
			expect(arrowFor(move(`${face}2`))).toEqual({ ...expected, half: true });
		},
	);

	it("matches the reference sheet for U' (step 4), R (step 5) and B' (step 13)", () => {
		expect(arrowFor(move("U'"))).toMatchObject({
			surface: "F",
			axis: "x",
			sign: 1,
		});
		expect(arrowFor(move("R"))).toMatchObject({
			surface: "F",
			axis: "y",
			sign: 1,
		});
		expect(arrowFor(move("B'"))).toMatchObject({
			surface: "R",
			axis: "y",
			sign: -1,
		});
	});
});

// Physical check, independent of the lookup table above: a clockwise quarter turn about
// the outward axis k moves a point p with velocity -(k x p).
type Vec3 = [number, number, number];

const AXIS: Record<string, Vec3> = {
	U: [0, 1, 0],
	D: [0, -1, 0],
	R: [1, 0, 0],
	L: [-1, 0, 0],
	F: [0, 0, 1],
	B: [0, 0, -1],
};

function velocity([k0, k1, k2]: Vec3, [p0, p1, p2]: Vec3): Vec3 {
	return [-(k1 * p2 - k2 * p1), -(k2 * p0 - k0 * p2), -(k0 * p1 - k1 * p0)];
}

/** A point on the arrow's surface, on the moved layer. */
function pointOnArrow(arrow: ArrowSpec): Vec3 {
	if (arrow.surface === "F") {
		return arrow.axis === "x" ? [0, arrow.line, 1.5] : [arrow.line, 0, 1.5];
	}
	return [1.5, 0, arrow.line];
}

describe("arrow direction follows the stickers", () => {
	const notations = FACES.flatMap((face) => [face, `${face}'`]);

	it.each(notations)(
		"%s arrow points where the layer's stickers travel",
		(notation) => {
			const m = move(notation);
			const arrow = arrowFor(m);
			const k = AXIS[m.face] as Vec3;
			const p = pointOnArrow(arrow);
			const v = velocity(k, p);
			const axisIndex = arrow.axis === "x" ? 0 : 1;
			const direction = Math.sign(v[axisIndex]) * m.turns;
			expect(direction).toBe(arrow.sign);
		},
	);

	it.each(notations)(
		"%s arrow lies in the layer that the move turns",
		(notation) => {
			const m = move(notation);
			const arrow = arrowFor(m);
			const k = AXIS[m.face] as Vec3;
			const p = pointOnArrow(arrow);
			const depth = p[0] * k[0] + p[1] * k[1] + p[2] * k[2];
			// The point sits on the moved layer: its coordinate along the turning axis is 1,
			// or it is on the face being turned (1.5 when the arrow surface is that face).
			expect([1, 1.5]).toContain(depth);
		},
	);
});
