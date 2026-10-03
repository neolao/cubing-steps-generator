import { describe, expect, it } from "vitest";
import { applySequence, solvedCube } from "../src/cube";
import { type Move, parseSequence } from "../src/moves";
import {
	buildFinalScene,
	buildScene,
	CUBE_BOUNDS,
	type Point,
	project,
	type StickerShape,
	sceneToSvg,
} from "../src/render";

function moves(notation: string): Move[] {
	const parsed = parseSequence(notation);
	if (!parsed.ok) {
		throw new Error(`bad test sequence ${notation}`);
	}
	return parsed.moves;
}

function firstMove(notation: string): Move {
	return moves(notation)[0] as Move;
}

function close(actual: Point, expected: Point) {
	expect(actual[0]).toBeCloseTo(expected[0], 3);
	expect(actual[1]).toBeCloseTo(expected[1], 3);
}

const SQRT3_2 = Math.sqrt(3) / 2;

describe("project", () => {
	// Reference sheet: one cubie edge goes right-down by (cos 30°, sin 30°) along x,
	// left-down by the same amount towards the viewer along z, and straight up along y.
	it("maps the cube axes to the isometric directions of the reference", () => {
		close(project([1, 0, 0]), [SQRT3_2, 0.5]);
		close(project([0, 1, 0]), [0, -1]);
		close(project([0, 0, 1]), [-SQRT3_2, 0.5]);
	});

	it("places the cube center at the origin", () => {
		close(project([0, 0, 0]), [0, 0]);
	});
});

describe("buildScene stickers", () => {
	const scene = buildScene(solvedCube(), firstMove("F"));

	it("draws 9 stickers on each of the 3 visible faces", () => {
		for (const face of ["U", "F", "R"] as const) {
			expect(scene.stickers.filter((s) => s.face === face)).toHaveLength(9);
		}
		expect(scene.stickers).toHaveLength(27);
	});

	it("draws the front-left sticker as the reference parallelogram", () => {
		const sticker = scene.stickers.find(
			(s) => s.face === "F" && s.row === 0 && s.col === 0,
		);
		const corners = [...(sticker as StickerShape).points].sort(
			(p, q) => p[0] - q[0] || p[1] - q[1],
		);
		const expected: Point[] = [
			[-3 * SQRT3_2, -1.5],
			[-3 * SQRT3_2, -0.5],
			[-2 * SQRT3_2, -1],
			[-2 * SQRT3_2, 0],
		];
		expected.forEach((point, i) => {
			close(corners[i] as Point, point);
		});
	});

	it("puts the back-left corner of the top face at the top of the cube", () => {
		const sticker = scene.stickers.find(
			(s) => s.face === "U" && s.row === 0 && s.col === 0,
		);
		const top = (sticker as StickerShape).points.reduce((a, b) =>
			b[1] < a[1] ? b : a,
		);
		close(top, [0, -3]);
	});

	it("keeps every sticker inside the declared cube bounds", () => {
		for (const sticker of scene.stickers) {
			for (const [x, y] of sticker.points) {
				expect(Math.abs(x)).toBeLessThanOrEqual(CUBE_BOUNDS.halfWidth + 1e-9);
				expect(Math.abs(y)).toBeLessThanOrEqual(CUBE_BOUNDS.halfHeight + 1e-9);
			}
		}
	});

	it("colors the stickers from the cube state (green front, orange right, yellow top)", () => {
		const color = (face: string, row: number, col: number) =>
			scene.stickers.find(
				(s) => s.face === face && s.row === row && s.col === col,
			)?.color;
		expect(color("F", 1, 1)).toBe("green");
		expect(color("R", 1, 1)).toBe("orange");
		expect(color("U", 1, 1)).toBe("yellow");
	});

	it("shows the state before the move: after F, the bottom row of the top face is red", () => {
		const afterF = applySequence(solvedCube(), moves("F"));
		const next = buildScene(afterF, firstMove("L"));
		const topBottomRow = next.stickers.filter(
			(s) => s.face === "U" && s.row === 2,
		);
		expect(topBottomRow.map((s) => s.color)).toEqual(["red", "red", "red"]);
	});
});

describe("buildScene arrow", () => {
	const tipMinusTail = (notation: string): Point => {
		const { arrow } = buildScene(solvedCube(), firstMove(notation));
		return [arrow.tip[0] - arrow.tail[0], arrow.tip[1] - arrow.tail[1]];
	};

	it("points down for F and L, up for R and B", () => {
		for (const notation of ["F", "L", "R'", "B'"]) {
			expect(tipMinusTail(notation)[1]).toBeGreaterThan(1);
		}
		for (const notation of ["R", "B", "L'", "F'"]) {
			expect(tipMinusTail(notation)[1]).toBeLessThan(-1);
		}
	});

	it("points left for U and D', right for U' and D", () => {
		expect(tipMinusTail("U")[0]).toBeLessThan(-1);
		expect(tipMinusTail("D'")[0]).toBeLessThan(-1);
		expect(tipMinusTail("U'")[0]).toBeGreaterThan(1);
		expect(tipMinusTail("D")[0]).toBeGreaterThan(1);
	});

	it("lies on the front face for U, D, L, R and on the right face for F and B", () => {
		const centerX = (notation: string) => {
			const { arrow } = buildScene(solvedCube(), firstMove(notation));
			return (arrow.tip[0] + arrow.tail[0]) / 2;
		};
		for (const notation of ["U", "D", "L", "R"]) {
			expect(centerX(notation)).toBeLessThan(0);
		}
		for (const notation of ["F", "B"]) {
			expect(centerX(notation)).toBeGreaterThan(0);
		}
	});

	it("draws the arrow of hidden-face moves on the visible edge of their layer", () => {
		const bottomRow = buildScene(solvedCube(), firstMove("D")).arrow;
		const topRow = buildScene(solvedCube(), firstMove("U")).arrow;
		const mid = (a: { tip: Point; tail: Point }) => (a.tip[1] + a.tail[1]) / 2;
		expect(mid(bottomRow)).toBeGreaterThan(mid(topRow) + 1.5);
	});

	it("stays inside the cube bounds for all 18 moves", () => {
		for (const face of ["U", "D", "L", "R", "F", "B"]) {
			for (const suffix of ["", "'", "2"]) {
				const { arrow } = buildScene(
					solvedCube(),
					firstMove(`${face}${suffix}`),
				);
				for (const [x, y] of arrow.points) {
					expect(Math.abs(x)).toBeLessThanOrEqual(CUBE_BOUNDS.halfWidth + 0.15);
					expect(Math.abs(y)).toBeLessThanOrEqual(
						CUBE_BOUNDS.halfHeight + 0.15,
					);
				}
			}
		}
	});
});

describe("buildScene repeat marker", () => {
	it("is present only for repeated turns and carries the count", () => {
		expect(buildScene(solvedCube(), firstMove("F2")).marker?.count).toBe(2);
		expect(buildScene(solvedCube(), firstMove("F3")).marker?.count).toBe(3);
		expect(buildScene(solvedCube(), firstMove("F")).marker).toBeNull();
		expect(buildScene(solvedCube(), firstMove("F'")).marker).toBeNull();
	});

	it("sits beside the arrow without covering it", () => {
		const { arrow, marker } = buildScene(solvedCube(), firstMove("L2"));
		const center = marker?.center as Point;
		const arrowMid: Point = [
			(arrow.tip[0] + arrow.tail[0]) / 2,
			(arrow.tip[1] + arrow.tail[1]) / 2,
		];
		const distance = Math.hypot(
			center[0] - arrowMid[0],
			center[1] - arrowMid[1],
		);
		expect(distance).toBeGreaterThan(1.3);
		expect(distance).toBeLessThan(2);
	});
});

describe("sceneToSvg", () => {
	const svg = sceneToSvg(buildScene(solvedCube(), firstMove("F2")), "s1");

	it("renders 27 stickers with the reference colors", () => {
		expect(svg.match(/<polygon[^>]*stroke="black"/g)).toHaveLength(27);
		for (const color of [
			"rgb(23,162,15)",
			"rgb(255,172,5)",
			"rgb(255,254,0)",
		]) {
			expect(svg).toContain(color);
		}
	});

	it("renders the arrow with a yellow-to-red gradient and a white outline", () => {
		expect(svg).toContain('<linearGradient id="s1-arrow"');
		expect(svg).toContain("rgb(255,0,0)");
		expect(svg).toContain("url(#s1-arrow)");
		expect(svg).toContain('stroke="white"');
	});

	it("prefixes ids so several cubes can share a page", () => {
		const other = sceneToSvg(buildScene(solvedCube(), firstMove("F2")), "s2");
		expect(other).toContain('id="s2-arrow"');
		expect(other).not.toContain('id="s1-arrow"');
	});

	it("writes the repeat count next to the cross", () => {
		const three = sceneToSvg(buildScene(solvedCube(), firstMove("L3")), "s4");
		expect(three).toMatch(/>3<\/text>/);
		expect(three).not.toMatch(/>2<\/text>/);
	});

	it("shows the repeat marker only for repeated turns", () => {
		expect(svg).toContain('data-role="repeat"');
		const quarter = sceneToSvg(buildScene(solvedCube(), firstMove("F")), "s3");
		expect(quarter).not.toContain('data-role="repeat"');
	});
});

describe("final state scene", () => {
	it("draws the 27 stickers without arrow or marker", () => {
		const scene = buildFinalScene(solvedCube());
		expect(scene.stickers).toHaveLength(27);
		expect("arrow" in scene).toBe(false);
		const svg = sceneToSvg(scene, "f");
		expect(svg).not.toContain("linearGradient");
		expect(svg).not.toContain('data-role="repeat"');
		expect(svg.match(/<polygon/g)).toHaveLength(27);
	});
});
