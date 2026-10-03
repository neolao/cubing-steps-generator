import { describe, expect, it } from "vitest";
import {
	applyMove,
	applySequence,
	COLORS,
	type Color,
	type CubeState,
	DEFAULT_ORIENTATION,
	isValidOrientation,
	oppositeColor,
	solvedCube,
	validFrontColors,
} from "../src/cube";
import { type Move, parseSequence } from "../src/moves";

// Face order of the 54 facelets: U, R, F, D, L, B (9 stickers each, row by row).
const LETTER_BY_COLOR: Record<Color, string> = {
	yellow: "U",
	orange: "R",
	green: "F",
	white: "D",
	red: "L",
	blue: "B",
};

function asString(state: CubeState): string {
	return state.map((color) => LETTER_BY_COLOR[color]).join("");
}

function move(notation: string): Move {
	const parsed = parseSequence(notation);
	if (!parsed.ok || parsed.moves.length !== 1) {
		throw new Error(`bad test move ${notation}`);
	}
	return parsed.moves[0] as Move;
}

function sequence(notation: string): CubeState {
	const parsed = parseSequence(notation);
	if (!parsed.ok) {
		throw new Error(`bad test sequence ${notation}`);
	}
	return applySequence(solvedCube(), parsed.moves);
}

const SOLVED = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

// Expected strings are derived by hand from the physical cube: for one clockwise
// quarter turn, each side strip receives the neighbouring face's strip.
const CLOCKWISE_FROM_SOLVED: Record<string, string> = {
	U: "UUUUUUUUU BBBRRRRRR RRRFFFFFF DDDDDDDDD FFFLLLLLL LLLBBBBBB",
	R: "UUFUUFUUF RRRRRRRRR FFDFFDFFD DDBDDBDDB LLLLLLLLL UBBUBBUBB",
	F: "UUUUUULLL URRURRURR FFFFFFFFF RRRDDDDDD LLDLLDLLD BBBBBBBBB",
	D: "UUUUUUUUU RRRRRRFFF FFFFFFLLL DDDDDDDDD LLLLLLBBB BBBBBBRRR",
	L: "BUUBUUBUU RRRRRRRRR UFFUFFUFF FDDFDDFDD LLLLLLLLL BBDBBDBBD",
	B: "RRRUUUUUU RRDRRDRRD FFFFFFFFF DDDDDDLLL ULLULLULL BBBBBBBBB",
};

describe("solvedCube", () => {
	it("has yellow on top, orange on the right and green in front", () => {
		expect(asString(solvedCube())).toBe(SOLVED);
	});
});

describe("applyMove", () => {
	it.each(Object.entries(CLOCKWISE_FROM_SOLVED))(
		"turning %s clockwise from solved moves the expected stickers",
		(face, expected) => {
			expect(asString(applyMove(solvedCube(), move(face)))).toBe(
				expected.replaceAll(" ", ""),
			);
		},
	);

	it.each(["U", "D", "L", "R", "F", "B"])(
		"four %s quarter turns restore the cube",
		(face) => {
			expect(asString(sequence(`${face} ${face} ${face} ${face}`))).toBe(
				SOLVED,
			);
		},
	);

	it.each(["U", "D", "L", "R", "F", "B"])("%s' undoes %s", (face) => {
		expect(asString(sequence(`${face} ${face}'`))).toBe(SOLVED);
	});

	it.each(["U", "D", "L", "R", "F", "B"])(
		"%s2 equals two quarter turns",
		(face) => {
			expect(asString(sequence(`${face}2`))).toBe(
				asString(sequence(`${face} ${face}`)),
			);
		},
	);

	it.each(["U", "D", "L", "R", "F", "B"])("%s3 equals %s'", (face) => {
		expect(asString(sequence(`${face}3`))).toBe(asString(sequence(`${face}'`)));
	});

	it.each(["U", "D", "L", "R", "F", "B"])(
		"four turns of %s leave the cube unchanged",
		(face) => {
			expect(asString(sequence(`${face} ${face} ${face} ${face}`))).toBe(
				SOLVED,
			);
		},
	);

	it("does not mutate the previous state", () => {
		const before = solvedCube();
		applyMove(before, move("R"));
		expect(asString(before)).toBe(SOLVED);
	});

	it("returns to solved after six repetitions of R U R' U'", () => {
		const sexyMove = "R U R' U' ".repeat(6).trim();
		expect(asString(sequence(sexyMove))).toBe(SOLVED);
	});

	it("does not return to solved after only five repetitions of R U R' U'", () => {
		expect(asString(sequence("R U R' U' ".repeat(5).trim()))).not.toBe(SOLVED);
	});

	it("keeps every color count at nine stickers", () => {
		const state = sequence("F L F U' R U F2 L2 U' L' B D' B' L2 U");
		for (const color of Object.keys(LETTER_BY_COLOR)) {
			expect(state.filter((c) => c === color)).toHaveLength(9);
		}
	});

	it("keeps the six centers fixed", () => {
		const state = sequence("F L F U' R U F2 L2 U' L' B D' B' L2 U");
		const centers = [4, 13, 22, 31, 40, 49].map(
			(index) => LETTER_BY_COLOR[state[index] as Color],
		);
		expect(centers.join("")).toBe("URFDLB");
	});
});

const FACE_START = { U: 0, R: 9, F: 18, D: 27, L: 36, B: 45 } as const;
const faceColor = (state: CubeState, face: keyof typeof FACE_START): Color =>
	state[FACE_START[face]] as Color;

describe("orientations", () => {
	it("defaults to yellow on top and green in front, the current solved cube", () => {
		expect(DEFAULT_ORIENTATION).toEqual({ top: "yellow", front: "green" });
		expect(asString(solvedCube(DEFAULT_ORIENTATION))).toBe(SOLVED);
	});

	it.each([
		// top, front, right (right = top x front, known color schemes)
		["white", "green", "red"],
		["white", "red", "blue"],
		["green", "white", "orange"],
		["yellow", "red", "green"],
		["blue", "yellow", "orange"],
		["orange", "green", "white"],
	] as const)(
		"holds %s on top and %s in front with %s on the right",
		(top, front, right) => {
			const state = solvedCube({ top, front });
			expect(faceColor(state, "U")).toBe(top);
			expect(faceColor(state, "F")).toBe(front);
			expect(faceColor(state, "R")).toBe(right);
			expect(faceColor(state, "D")).toBe(oppositeColor(top));
			expect(faceColor(state, "B")).toBe(oppositeColor(front));
			expect(faceColor(state, "L")).toBe(oppositeColor(right));
		},
	);

	it("builds a solved cube with nine stickers per face for all 24 orientations", () => {
		let count = 0;
		for (const top of COLORS) {
			for (const front of validFrontColors(top)) {
				count++;
				const state = solvedCube({ top, front });
				for (const face of Object.keys(
					FACE_START,
				) as (keyof typeof FACE_START)[]) {
					const start = FACE_START[face];
					expect(new Set(state.slice(start, start + 9)).size).toBe(1);
				}
				expect(new Set(state).size).toBe(6);
			}
		}
		expect(count).toBe(24);
	});

	it("applies moves relative to the chosen orientation", () => {
		const state = applyMove(
			solvedCube({ top: "white", front: "green" }),
			move("F"),
		);
		// F turns the face in front: the left face (orange) feeds the top row
		expect(faceColor(state, "F")).toBe("green");
		expect(state.slice(0, 9).filter((c) => c === "white")).toHaveLength(6);
		expect(state.slice(0, 9).filter((c) => c === "orange")).toHaveLength(3);
	});

	it("offers four front colors for each top color, never the top or its opposite", () => {
		for (const top of COLORS) {
			const fronts = validFrontColors(top);
			expect(fronts).toHaveLength(4);
			expect(fronts).not.toContain(top);
			expect(fronts).not.toContain(oppositeColor(top));
		}
	});

	it("rejects the same color or opposite colors for top and front", () => {
		expect(isValidOrientation({ top: "white", front: "white" })).toBe(false);
		expect(isValidOrientation({ top: "white", front: "yellow" })).toBe(false);
		expect(isValidOrientation({ top: "white", front: "blue" })).toBe(true);
		expect(() => solvedCube({ top: "red", front: "orange" })).toThrow();
	});
});
