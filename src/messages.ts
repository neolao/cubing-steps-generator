import type { Translation } from "./i18n/types";
import type { SequenceError } from "./moves";

/** User-facing text for a rejected move. */
export function describeError(
	{ kind, token, position }: SequenceError,
	t: Translation,
): string {
	if (kind === "bad-suffix") {
		return t.errors.badSuffix(position, token, token.charAt(0));
	}
	if (/^[a-z]/.test(token)) {
		return t.errors.lowercase(position, token);
	}
	return t.errors.notAFace(position, token);
}
