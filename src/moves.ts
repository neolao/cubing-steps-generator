const MOVE_PATTERN = /^[UDLRFB](2|')?$/;

export function parseSequence(text: string): string[] {
	const moves = text.split(/\s+/).filter(Boolean);
	const invalid = moves.find((move) => !MOVE_PATTERN.test(move));
	if (invalid) {
		throw new Error(`Invalid move: ${invalid}`);
	}
	return moves;
}
