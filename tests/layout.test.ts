import { describe, expect, it } from "vitest";
import {
	layoutSheet,
	MAX_COLUMNS,
	MAX_STEPS_PER_PAGE,
	MIN_COLUMNS,
	PAGE,
	type StepPlacement,
} from "../src/layout";
import { type Move, parseSequence } from "../src/moves";
import { CUBE_BOUNDS } from "../src/render";

function moves(count: number): Move[] {
	const cycle = [
		"F",
		"L",
		"F",
		"U'",
		"R",
		"U",
		"F2",
		"L2",
		"U'",
		"L'",
		"B",
		"D'",
		"B'",
		"L2",
		"U",
	];
	const notation = Array.from(
		{ length: count },
		(_, i) => cycle[i % cycle.length],
	).join(" ");
	const parsed = parseSequence(notation);
	if (!parsed.ok) {
		throw new Error("bad test sequence");
	}
	return parsed.moves;
}

function distinct(values: number[]): number[] {
	return [...new Set(values.map((v) => Math.round(v * 100) / 100))].sort(
		(a, b) => a - b,
	);
}

const cubeExtent = (p: StepPlacement) => ({
	left: p.cubeX - CUBE_BOUNDS.halfWidth * p.scale,
	right: p.cubeX + CUBE_BOUNDS.halfWidth * p.scale,
	top: p.cubeY - CUBE_BOUNDS.halfHeight * p.scale,
	bottom: p.cubeY + CUBE_BOUNDS.halfHeight * p.scale,
});

describe("page constants", () => {
	it("uses A4 portrait at 300 dpi, three columns and at most 30 steps per page", () => {
		expect(PAGE.width).toBe(2481);
		expect(PAGE.height).toBe(3508);
		expect(MIN_COLUMNS).toBe(3);
		expect(MAX_COLUMNS).toBe(5);
		expect(MAX_STEPS_PER_PAGE).toBe(30);
	});

	it("keeps margins beyond the 5 mm unprintable border (59 px at 300 dpi)", () => {
		expect(PAGE.margin).toBeGreaterThanOrEqual(59);
	});
});

describe("layoutSheet with the 15 reference steps", () => {
	const pages = layoutSheet(moves(15));
	const steps = pages[0]?.steps as StepPlacement[];

	it("fits one page of 3 columns by 5 rows", () => {
		expect(pages).toHaveLength(1);
		expect(steps).toHaveLength(15);
		expect(distinct(steps.map((s) => s.cubeX))).toHaveLength(3);
		expect(distinct(steps.map((s) => s.cubeY))).toHaveLength(5);
	});

	it("labels each step '#n - move' in reading order", () => {
		expect(steps.slice(0, 4).map((s) => s.label)).toEqual([
			"#1 - F",
			"#2 - L",
			"#3 - F",
			"#4 - U'",
		]);
		expect(steps[14]?.label).toBe("#15 - U");
	});

	it("fills rows left to right, then top to bottom", () => {
		expect(steps[0]?.cubeX).toBeLessThan(steps[1]?.cubeX as number);
		expect(steps[1]?.cubeX).toBeLessThan(steps[2]?.cubeX as number);
		expect(steps[3]?.cubeY).toBeGreaterThan(steps[0]?.cubeY as number);
		expect(steps[3]?.cubeX).toBe(steps[0]?.cubeX);
	});

	it("draws cubes about as large as the reference sheet (edge 94.7 px)", () => {
		const scale = steps[0]?.scale as number;
		expect(scale).toBeGreaterThan(80);
		expect(scale).toBeLessThan(100);
	});

	it("uses one cube size and one label size for every step", () => {
		expect(distinct(steps.map((s) => s.scale))).toHaveLength(1);
		expect(distinct(steps.map((s) => s.fontSize))).toHaveLength(1);
	});

	it("aligns labels and cubes across a row", () => {
		const firstRow = steps.slice(0, 3);
		expect(distinct(firstRow.map((s) => s.labelY))).toHaveLength(1);
		expect(distinct(firstRow.map((s) => s.cubeY))).toHaveLength(1);
	});

	it("keeps every cube and label inside the page margins", () => {
		for (const step of steps) {
			const box = cubeExtent(step);
			expect(box.left).toBeGreaterThanOrEqual(PAGE.margin);
			expect(box.right).toBeLessThanOrEqual(PAGE.width - PAGE.margin);
			expect(box.top).toBeGreaterThanOrEqual(PAGE.margin);
			expect(box.bottom).toBeLessThanOrEqual(PAGE.height - PAGE.margin);
			expect(step.labelX).toBeGreaterThanOrEqual(PAGE.margin);
		}
	});

	it("keeps each label above its cube", () => {
		for (const step of steps) {
			expect(step.labelY).toBeLessThan(cubeExtent(step).top);
		}
	});
});

describe("layoutSheet size adaptation", () => {
	it("does not enlarge cubes for a single step", () => {
		const one = layoutSheet(moves(1))[0]?.steps ?? [];
		const fifteen = layoutSheet(moves(15))[0]?.steps ?? [];
		expect(one).toHaveLength(1);
		expect(one[0]?.scale).toBe(fifteen[0]?.scale);
	});

	it("fills the page with 5 columns of 6 rows for 30 steps, without overlap", () => {
		const pages = layoutSheet(moves(30));
		const steps = pages[0]?.steps as StepPlacement[];
		expect(pages).toHaveLength(1);
		const columns = distinct(steps.map((s) => s.cubeX)).length;
		expect(columns).toBe(5);
		expect(distinct(steps.map((s) => s.cubeY))).toHaveLength(6);
		const scale = steps[0]?.scale as number;
		expect(scale).toBeLessThan(
			layoutSheet(moves(15))[0]?.steps[0]?.scale as number,
		);
		// Three columns would need 10 rows and cubes of about 44 px.
		expect(scale).toBeGreaterThan(70);
		for (let i = 0; i + columns < steps.length; i++) {
			const current = steps[i] as StepPlacement;
			const below = steps[i + columns] as StepPlacement;
			expect(cubeExtent(current).bottom).toBeLessThan(
				below.labelY - below.fontSize,
			);
		}
		for (const step of steps) {
			const box = cubeExtent(step);
			expect(box.bottom).toBeLessThanOrEqual(PAGE.height - PAGE.margin);
			expect(box.right).toBeLessThanOrEqual(PAGE.width - PAGE.margin);
		}
	});

	it("switches to 4 columns as soon as 3 columns would shrink the cubes", () => {
		const reference = layoutSheet(moves(15))[0]?.steps[0]?.scale as number;
		for (const count of [16, 20]) {
			const steps = layoutSheet(moves(count))[0]?.steps as StepPlacement[];
			expect(distinct(steps.map((s) => s.cubeX))).toHaveLength(4);
			expect(steps[0]?.scale).toBe(reference);
		}
	});

	it("never enlarges cubes beyond the reference size, whatever the step count", () => {
		const reference = layoutSheet(moves(15))[0]?.steps[0]?.scale as number;
		for (let count = 1; count <= 30; count++) {
			const scale = layoutSheet(moves(count))[0]?.steps[0]?.scale as number;
			expect(scale).toBeLessThanOrEqual(reference);
		}
	});

	it("never makes cubes smaller when there are fewer steps", () => {
		let previous = Number.POSITIVE_INFINITY;
		for (let count = 1; count <= 30; count++) {
			const scale = layoutSheet(moves(count))[0]?.steps[0]?.scale as number;
			expect(scale).toBeLessThanOrEqual(previous + 1e-9);
			previous = scale;
		}
	});

	it("keeps every step inside the margins for every step count", () => {
		for (let count = 1; count <= 65; count++) {
			for (const page of layoutSheet(moves(count))) {
				for (const step of page.steps) {
					const box = cubeExtent(step);
					expect(box.left).toBeGreaterThanOrEqual(PAGE.margin);
					expect(box.right).toBeLessThanOrEqual(PAGE.width - PAGE.margin);
					expect(box.top).toBeGreaterThanOrEqual(PAGE.margin);
					expect(box.bottom).toBeLessThanOrEqual(PAGE.height - PAGE.margin);
				}
			}
		}
	});

	it("never shrinks labels below 8 pt when printed (34 px at 300 dpi)", () => {
		for (const count of [1, 15, 20, 30]) {
			const step = layoutSheet(moves(count))[0]?.steps[0] as StepPlacement;
			expect(step.fontSize).toBeGreaterThanOrEqual(34);
		}
	});
});

describe("layoutSheet pagination", () => {
	it("starts a second page after 30 steps and keeps numbering and size", () => {
		const pages = layoutSheet(moves(31));
		expect(pages).toHaveLength(2);
		expect(pages[0]?.steps).toHaveLength(30);
		expect(pages[1]?.steps).toHaveLength(1);
		expect(pages[1]?.steps[0]?.label).toBe("#31 - F");
		expect(pages[1]?.steps[0]?.scale).toBe(pages[0]?.steps[0]?.scale);
	});

	it("splits 65 steps over three pages", () => {
		const pages = layoutSheet(moves(65));
		expect(pages.map((p) => p.steps.length)).toEqual([30, 30, 5]);
		expect(pages[2]?.steps[4]?.label).toBe("#65 - R");
	});

	it("gives an empty sequence one blank page", () => {
		const pages = layoutSheet([]);
		expect(pages).toHaveLength(1);
		expect(pages[0]?.steps).toEqual([]);
	});

	it("links each placement to its move", () => {
		const list = moves(4);
		const steps = layoutSheet(list)[0]?.steps as StepPlacement[];
		expect(steps.map((s) => s.move)).toEqual(list);
	});
});

describe("layoutSheet with a final state", () => {
	it("adds one unnumbered cell after the last step", () => {
		const steps = layoutSheet(moves(15), true)[0]?.steps as StepPlacement[];
		expect(steps).toHaveLength(16);
		const final = steps[15] as StepPlacement;
		expect(final.label).toBe("Final state");
		expect(final.move).toBeNull();
		expect(final.index).toBe(16);
		expect(steps.slice(0, 15).every((s) => s.move !== null)).toBe(true);
	});

	it("keeps the sheet unchanged when no final state is asked", () => {
		expect(layoutSheet(moves(15), false)).toEqual(layoutSheet(moves(15)));
	});

	it("puts the final state alone on a new page after exactly 30 steps", () => {
		const pages = layoutSheet(moves(30), true);
		expect(pages).toHaveLength(2);
		expect(pages[0]?.steps).toHaveLength(30);
		expect(pages[1]?.steps.map((s) => s.label)).toEqual(["Final state"]);
	});

	it("keeps the final state on the same page after 29 steps", () => {
		const pages = layoutSheet(moves(29), true);
		expect(pages).toHaveLength(1);
		expect(pages[0]?.steps).toHaveLength(30);
	});

	it("does not draw a final state for an empty sequence", () => {
		const pages = layoutSheet([], true);
		expect(pages).toHaveLength(1);
		expect(pages[0]?.steps).toHaveLength(0);
	});
});
