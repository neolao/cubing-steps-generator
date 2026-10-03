export const FACES = ["U", "D", "L", "R", "F", "B"] as const;
export type Face = (typeof FACES)[number];

export interface Move {
	face: Face;
	/** 1 = clockwise quarter turn, -1 = counter-clockwise, 2 = half turn. */
	turns: 1 | -1 | 2;
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

const TURNS_BY_SUFFIX = { "": 1, "'": -1, "2": 2 } as const;

function parseToken(token: string, position: number): Move | SequenceError {
	const face = FACES.find((candidate) => candidate === token[0]);
	if (!face) {
		return { kind: "unknown-face", token, position };
	}
	const suffix = token.slice(1);
	if (!(suffix in TURNS_BY_SUFFIX)) {
		return { kind: "bad-suffix", token, position };
	}
	return {
		face,
		turns: TURNS_BY_SUFFIX[suffix as keyof typeof TURNS_BY_SUFFIX],
		notation: token,
	};
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
