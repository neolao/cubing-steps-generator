import { describe, expect, it } from "vitest";
import {
	applyMove,
	applySequence,
	type Color,
	type CubeState,
	solvedCube,
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
		"%s4 leaves the cube unchanged",
		(face) => {
			expect(asString(sequence(`${face}4`))).toBe(SOLVED);
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
