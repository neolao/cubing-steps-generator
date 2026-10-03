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

const FACE_COLOR: Record<Face, Color> = {
	U: "yellow",
	R: "orange",
	F: "green",
	D: "white",
	L: "red",
	B: "blue",
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

export function solvedCube(): CubeState {
	return FACE_ORDER.flatMap((face) => Array<Color>(9).fill(FACE_COLOR[face]));
}

function quarterTurn(state: CubeState, face: Face): CubeState {
	const next = [...state];
	QUARTER_TURN_DESTINATIONS[face].forEach((destination, from) => {
		next[destination] = state[from] as Color;
	});
	return next;
}

export function applyMove(state: CubeState, move: Move): CubeState {
	const quarterTurns = move.turns === -1 ? 3 : move.turns;
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
