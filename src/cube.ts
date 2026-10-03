import type { Face, Move } from "./moves";

export type Color = "yellow" | "orange" | "green" | "white" | "red" | "blue";

/** 54 stickers: faces U, R, F, D, L, B (9 each, read row by row as seen from outside). */
export type CubeState = readonly Color[];

export type Vec = readonly [number, number, number];

/** Faces in the order their stickers are stored in a cube state. */
export const FACE_ORDER: readonly Face[] = ["U", "R", "F", "D", "L", "B"];

export const FACE_NORMAL: Record<Face, Vec> = {
	U: [0, 1, 0],
	D: [0, -1, 0],
	R: [1, 0, 0],
	L: [-1, 0, 0],
	F: [0, 0, 1],
	B: [0, 0, -1],
};

export const COLORS: readonly Color[] = [
	"yellow",
	"orange",
	"green",
	"white",
	"red",
	"blue",
];

/** Where each color sits on the default cube (yellow up, green in front, orange on the right). */
const COLOR_DIRECTION: Record<Color, Vec> = {
	yellow: [0, 1, 0],
	white: [0, -1, 0],
	orange: [1, 0, 0],
	red: [-1, 0, 0],
	green: [0, 0, 1],
	blue: [0, 0, -1],
};

/** How the cube is held at the start: the colors of its top and front faces. */
export interface Orientation {
	top: Color;
	front: Color;
}

export const DEFAULT_ORIENTATION: Orientation = {
	top: "yellow",
	front: "green",
};

/** Cubie coordinates (each -1..1) of the sticker at `row`, `col` of `face`. */
export function stickerPosition(face: Face, row: number, col: number): Vec {
	switch (face) {
		case "U":
			return [col - 1, 1, row - 1];
		case "R":
			return [1, 1 - row, 1 - col];
		case "F":
			return [col - 1, 1 - row, 1];
		case "D":
			return [col - 1, -1, 1 - row];
		case "L":
			return [-1, 1 - row, col - 1];
		case "B":
			return [1 - col, 1 - row, -1];
	}
}

function indexOf(face: Face, row: number, col: number): number {
	return FACE_ORDER.indexOf(face) * 9 + row * 3 + col;
}

const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0],
];

/** Clockwise quarter turn about `axis`, seen from outside along that axis. */
function rotateClockwise(axis: Vec, v: Vec): Vec {
	const c = cross(axis, v);
	const d = dot(axis, v);
	return [axis[0] * d - c[0], axis[1] * d - c[1], axis[2] * d - c[2]];
}

interface Sticker {
	face: Face;
	index: number;
	position: Vec;
}

const STICKERS: readonly Sticker[] = FACE_ORDER.flatMap((face) =>
	Array.from({ length: 9 }, (_, i) => {
		const row = Math.floor(i / 3);
		const col = i % 3;
		return {
			face,
			index: indexOf(face, row, col),
			position: stickerPosition(face, row, col),
		};
	}),
);

const key = (position: Vec, normal: Vec): string =>
	`${position.join(",")}|${normal.join(",")}`;

const INDEX_BY_KEY = new Map(
	STICKERS.map((s) => [key(s.position, FACE_NORMAL[s.face]), s.index] as const),
);

function quarterTurnDestinations(layerFace: Face): readonly number[] {
	const axis = FACE_NORMAL[layerFace];
	return STICKERS.map((s) => {
		if (dot(s.position, axis) !== 1) {
			return s.index;
		}
		const position = rotateClockwise(axis, s.position);
		const normal = rotateClockwise(axis, FACE_NORMAL[s.face]);
		return INDEX_BY_KEY.get(key(position, normal)) as number;
	});
}

/** For each clockwise quarter turn: destination index of every sticker (`destinations[from] = to`). */
const QUARTER_TURN_DESTINATIONS: Record<Face, readonly number[]> = {
	U: quarterTurnDestinations("U"),
	D: quarterTurnDestinations("D"),
	L: quarterTurnDestinations("L"),
	R: quarterTurnDestinations("R"),
	F: quarterTurnDestinations("F"),
	B: quarterTurnDestinations("B"),
};

function colorAt(direction: Vec): Color {
	return COLORS.find(
		(color) => dot(COLOR_DIRECTION[color], direction) === 1,
	) as Color;
}

export function oppositeColor(color: Color): Color {
	const [x, y, z] = COLOR_DIRECTION[color];
	return colorAt([-x, -y, -z]);
}

export function isValidOrientation({ top, front }: Orientation): boolean {
	return top !== front && front !== oppositeColor(top);
}

/** The four colors that can face the front when `top` is on top. */
export function validFrontColors(top: Color): Color[] {
	return COLORS.filter((front) => isValidOrientation({ top, front }));
}

/** A solved cube held in `orientation`; the right face color is top x front. */
export function solvedCube(
	orientation: Orientation = DEFAULT_ORIENTATION,
): CubeState {
	if (!isValidOrientation(orientation)) {
		throw new Error(
			`Invalid orientation: ${orientation.top} on top, ${orientation.front} in front`,
		);
	}
	const { top, front } = orientation;
	const right = colorAt(cross(COLOR_DIRECTION[top], COLOR_DIRECTION[front]));
	const faceColor: Record<Face, Color> = {
		U: top,
		D: oppositeColor(top),
		F: front,
		B: oppositeColor(front),
		R: right,
		L: oppositeColor(right),
	};
	return FACE_ORDER.flatMap((face) => Array<Color>(9).fill(faceColor[face]));
}

function quarterTurn(state: CubeState, face: Face): CubeState {
	const next = [...state];
	QUARTER_TURN_DESTINATIONS[face].forEach((destination, from) => {
		next[destination] = state[from] as Color;
	});
	return next;
}

export function applyMove(state: CubeState, move: Move): CubeState {
	const quarterTurns = move.turns === -1 ? 3 : move.turns % 4;
	let next = state;
	for (let i = 0; i < quarterTurns; i++) {
		next = quarterTurn(next, move.face);
	}
	return next;
}

export function applySequence(
	state: CubeState,
	moves: readonly Move[],
): CubeState {
	return moves.reduce(applyMove, state);
}
