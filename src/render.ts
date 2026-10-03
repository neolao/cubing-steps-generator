import { type ArrowSpec, arrowFor } from "./arrows";
import {
	type Color,
	type CubeState,
	FACE_ORDER,
	stickerPosition,
} from "./cube";
import type { Move } from "./moves";

export type Point = readonly [number, number];
type Vec3 = readonly [number, number, number];
type VisibleFace = "U" | "F" | "R";

export interface StickerShape {
	face: VisibleFace;
	row: number;
	col: number;
	color: Color;
	points: Point[];
}

export interface ArrowShape {
	/** Outline of the arrow, in cubie-edge units around the cube center. */
	points: Point[];
	tail: Point;
	tip: Point;
}

export interface CubeScene {
	stickers: StickerShape[];
	arrow: ArrowShape;
	/** Where the "x2" marker of a half turn goes, null for quarter turns. */
	marker: { center: Point } | null;
}

/** Half extents of the cube drawing, in cubie-edge units. */
export const CUBE_BOUNDS = { halfWidth: 1.5 * Math.sqrt(3), halfHeight: 3 };

const COS_30 = Math.sqrt(3) / 2;

/** Isometric projection: x goes right-down, z left-down (towards the viewer), y up. */
export function project([x, y, z]: Vec3): Point {
	return [COS_30 * (x - z), 0.5 * (x + z) - y];
}

const RGB: Record<Color, string> = {
	green: "rgb(23,162,15)",
	yellow: "rgb(255,254,0)",
	orange: "rgb(255,172,5)",
	red: "rgb(215,13,13)",
	blue: "rgb(74,80,242)",
	white: "rgb(255,255,255)",
};

const VISIBLE_FACES: readonly VisibleFace[] = ["U", "F", "R"];

/** Unit vectors of the two in-plane axes of each visible face, and its outward normal. */
const FACE_FRAME: Record<VisibleFace, { a: Vec3; b: Vec3; normal: Vec3 }> = {
	U: { a: [1, 0, 0], b: [0, 0, 1], normal: [0, 1, 0] },
	F: { a: [1, 0, 0], b: [0, 1, 0], normal: [0, 0, 1] },
	R: { a: [0, 1, 0], b: [0, 0, 1], normal: [1, 0, 0] },
};

const add = (u: Vec3, v: Vec3, scale = 1): Vec3 => [
	u[0] + scale * v[0],
	u[1] + scale * v[1],
	u[2] + scale * v[2],
];

function stickerShape(
	state: CubeState,
	face: VisibleFace,
	row: number,
	col: number,
): StickerShape {
	const { a, b, normal } = FACE_FRAME[face];
	const surfaceCenter = add(stickerPosition(face, row, col), normal, 0.5);
	const points = (
		[
			[-0.5, -0.5],
			[0.5, -0.5],
			[0.5, 0.5],
			[-0.5, 0.5],
		] as const
	).map(([da, db]) => project(add(add(surfaceCenter, a, da), b, db)));
	const index = FACE_ORDER.indexOf(face) * 9 + row * 3 + col;
	return { face, row, col, color: state[index] as Color, points };
}

// Arrow proportions, taken from the reference sheet (head 31% of the length, head
// width 35%, shaft width 12%); the length covers about 80% of a face.
const ARROW_LENGTH = 2.35;
const HEAD_LENGTH = 0.309 * ARROW_LENGTH;
const HEAD_WIDTH = 0.3487 * ARROW_LENGTH;
const SHAFT_WIDTH = 0.122 * ARROW_LENGTH;
const MARKER_OFFSET = 0.95;

interface ArrowFrame {
	center: Vec3;
	along: Vec3;
	across: Vec3;
}

function arrowFrame(spec: ArrowSpec): ArrowFrame {
	const { surface, axis, line, sign } = spec;
	if (surface === "R") {
		return { center: [1.5, 0, line], along: [0, sign, 0], across: [0, 0, 1] };
	}
	return axis === "x"
		? { center: [0, line, 1.5], along: [sign, 0, 0], across: [0, 1, 0] }
		: { center: [line, 0, 1.5], along: [0, sign, 0], across: [1, 0, 0] };
}

function arrowShape({ center, along, across }: ArrowFrame): ArrowShape {
	const at = (u: number, v: number): Point =>
		project(add(add(center, along, u), across, v));
	const half = ARROW_LENGTH / 2;
	const headBase = half - HEAD_LENGTH;
	return {
		points: [
			at(-half, SHAFT_WIDTH / 2),
			at(headBase, SHAFT_WIDTH / 2),
			at(headBase, HEAD_WIDTH / 2),
			at(half, 0),
			at(headBase, -HEAD_WIDTH / 2),
			at(headBase, -SHAFT_WIDTH / 2),
			at(-half, -SHAFT_WIDTH / 2),
		],
		tail: at(-half, 0),
		tip: at(half, 0),
	};
}

export function buildScene(state: CubeState, move: Move): CubeScene {
	const stickers = VISIBLE_FACES.flatMap((face) =>
		Array.from({ length: 9 }, (_, i) =>
			stickerShape(state, face, Math.floor(i / 3), i % 3),
		),
	);
	const spec = arrowFor(move);
	const frame = arrowFrame(spec);
	// The marker moves from the arrow towards the middle of the face.
	const markerCenter = add(
		frame.center,
		frame.across,
		-spec.line * MARKER_OFFSET,
	);
	return {
		stickers,
		arrow: arrowShape(frame),
		marker: spec.half ? { center: project(markerCenter) } : null,
	};
}

const fmt = (n: number): string => String(Math.round(n * 1000) / 1000);
const pointList = (points: readonly Point[]): string =>
	points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(" ");

function markerSvg([cx, cy]: Point): string {
	const arm = 0.27;
	const cross = (x: number, y: number) =>
		`M${fmt(x - arm)},${fmt(y - arm)}L${fmt(x + arm)},${fmt(y + arm)}M${fmt(x + arm)},${fmt(y - arm)}L${fmt(x - arm)},${fmt(y + arm)}`;
	const crossX = cx - 0.42;
	const textX = cx + 0.08;
	const textY = cy + 0.3;
	const textAttrs = `x="${fmt(textX)}" y="${fmt(textY)}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="0.85"`;
	return [
		'<g data-role="half-turn" stroke-linecap="round">',
		`<path d="${cross(crossX, cy)}" stroke="white" stroke-width="0.22" fill="none"/>`,
		`<path d="${cross(crossX, cy)}" stroke="rgb(252,1,1)" stroke-width="0.11" fill="none"/>`,
		`<text ${textAttrs} fill="white" stroke="white" stroke-width="0.1" stroke-linejoin="round">2</text>`,
		`<text ${textAttrs} fill="rgb(252,1,1)">2</text>`,
		"</g>",
	].join("");
}

/** SVG group of one cube, centered on the origin, one cubie edge = 1 user unit. */
export function sceneToSvg(scene: CubeScene, idPrefix: string): string {
	const gradientId = `${idPrefix}-arrow`;
	const { arrow } = scene;
	const stickers = scene.stickers
		.map(
			(s) =>
				`<polygon points="${pointList(s.points)}" fill="${RGB[s.color]}" stroke="black" stroke-width="0.015" stroke-linejoin="round"/>`,
		)
		.join("");
	const gradient =
		`<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${fmt(arrow.tail[0])}" y1="${fmt(arrow.tail[1])}" x2="${fmt(arrow.tip[0])}" y2="${fmt(arrow.tip[1])}">` +
		'<stop offset="0" stop-color="rgb(255,254,0)"/><stop offset="1" stop-color="rgb(255,0,0)"/></linearGradient></defs>';
	const arrowSvg = `<polygon points="${pointList(arrow.points)}" fill="url(#${gradientId})" stroke="white" stroke-width="0.085" stroke-linejoin="round"/>`;
	const marker = scene.marker ? markerSvg(scene.marker.center) : "";
	return `<g>${gradient}${stickers}${arrowSvg}${marker}</g>`;
}
