export const FACES = ["U", "D", "L", "R", "F", "B"] as const;
export type Face = (typeof FACES)[number];

export interface Move {
	face: Face;
	/** -1 = counter-clockwise quarter turn; 1 or more = that many clockwise quarter turns (L3 = 3). */
	turns: number;
	notation: string;
}

export interface SequenceError {
	kind: "unknown-face" | "bad-suffix";
	token: string;
	/** 1-based position of the token in the sequence. */
	position: number;
}

export type ParseResult =
	| { ok: true; moves: Move[] }
	| { ok: false; error: SequenceError };

/** "" = one clockwise turn, "'" = counter-clockwise, "2" or "3" = repeated clockwise turns. */
function parseTurns(suffix: string): number | null {
	if (suffix === "") {
		return 1;
	}
	if (suffix === "'") {
		return -1;
	}
	return /^[23]$/.test(suffix) ? Number(suffix) : null;
}

function parseToken(token: string, position: number): Move | SequenceError {
	const face = FACES.find((candidate) => candidate === token[0]);
	if (!face) {
		return { kind: "unknown-face", token, position };
	}
	const turns = parseTurns(token.slice(1));
	if (turns === null) {
		return { kind: "bad-suffix", token, position };
	}
	return { face, turns, notation: token };
}

export function parseSequence(text: string): ParseResult {
	const moves: Move[] = [];
	const tokens = text.split(/\s+/).filter(Boolean);
	for (const [index, token] of tokens.entries()) {
		const parsed = parseToken(token, index + 1);
		if ("kind" in parsed) {
			return { ok: false, error: parsed };
		}
		moves.push(parsed);
	}
	return { ok: true, moves };
}
