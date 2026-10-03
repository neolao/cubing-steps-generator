import type { SequenceError } from "./moves";

/** User-facing text for a rejected move. */
export function describeError({
	kind,
	token,
	position,
}: SequenceError): string {
	const where = `Move ${position} '${token}'`;
	if (kind === "bad-suffix") {
		const face = token.charAt(0);
		return `${where} is not valid. Write it ${face}, ${face}' or ${face}2.`;
	}
	if (/^[a-z]/.test(token)) {
		return `${where} is not supported. Use the capital letters U, D, L, R, F or B.`;
	}
	return `${where} is not a cube face. Use U, D, L, R, F or B.`;
}
