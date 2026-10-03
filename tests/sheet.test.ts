import { describe, expect, it } from "vitest";
import { type Move, parseSequence } from "../src/moves";
import { renderSheet } from "../src/sheet";

function moves(notation: string): Move[] {
	const parsed = parseSequence(notation);
	if (!parsed.ok) {
		throw new Error(`bad test sequence ${notation}`);
	}
	return parsed.moves;
}

const REFERENCE = "F L F U' R U F2 L2 U' L' B D' B' L2 U";
const count = (text: string, part: string) => text.split(part).length - 1;

describe("renderSheet", () => {
	const [page] = renderSheet(moves(REFERENCE)) as [string];

	it("renders the reference sequence as one A4 page of 15 cubes", () => {
		expect(renderSheet(moves(REFERENCE))).toHaveLength(1);
		expect(page).toContain('viewBox="0 0 2481 3508"');
		expect(count(page, 'data-role="step"')).toBe(15);
		expect(count(page, 'stroke="black"')).toBe(15 * 27);
	});

	it("starts with a white page background", () => {
		expect(page).toMatch(
			/<rect[^>]*width="2481"[^>]*height="3508"[^>]*fill="white"/,
		);
	});

	it("writes each label in Arial Bold", () => {
		expect(page).toContain(">#1 - F</text>");
		expect(page).toContain(">#4 - U'</text>");
		expect(page).toContain(">#15 - U</text>");
		expect(page).toContain('font-family="Arial, Helvetica, sans-serif"');
		expect(page).toContain('font-weight="bold"');
	});

	it("marks the half turns of the reference sequence (steps 7, 8 and 14)", () => {
		expect(count(page, 'data-role="half-turn"')).toBe(3);
	});

	it("gives every arrow gradient its own id", () => {
		const ids = [...page.matchAll(/linearGradient id="([^"]+)"/g)].map(
			(m) => m[1],
		);
		expect(ids).toHaveLength(15);
		expect(new Set(ids).size).toBe(15);
	});

	it("shows the cube state before each move", () => {
		const red = "rgb(215,13,13)";
		expect(count((renderSheet(moves("F")) as [string])[0], red)).toBe(0);
		expect(count((renderSheet(moves("F L")) as [string])[0], red)).toBe(3);
	});

	it("renders one blank page for an empty sequence", () => {
		const pages = renderSheet([]);
		expect(pages).toHaveLength(1);
		expect(count(pages[0] as string, 'data-role="step"')).toBe(0);
	});

	it("renders one page per 30 steps", () => {
		const long = Array.from({ length: 31 }, () => "R").join(" ");
		const pages = renderSheet(moves(long));
		expect(pages).toHaveLength(2);
		expect(pages[1]).toContain(">#31 - R</text>");
		const ids = pages.flatMap((p) =>
			[...p.matchAll(/linearGradient id="([^"]+)"/g)].map((m) => m[1]),
		);
		expect(new Set(ids).size).toBe(31);
	});
});
