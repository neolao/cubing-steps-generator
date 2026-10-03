import { describe, expect, it } from "vitest";
import { describeError } from "../src/messages";
import { parseSequence } from "../src/moves";

function errorFor(text: string) {
	const result = parseSequence(text);
	if (result.ok) {
		throw new Error("expected an error");
	}
	return result.error;
}

describe("describeError", () => {
	it("names the unknown face and its position", () => {
		expect(describeError(errorFor("F L X U"))).toBe(
			"Move 3 'X' is not a cube face. Use U, D, L, R, F or B.",
		);
	});

	it("explains that lowercase and wide moves are not supported", () => {
		expect(describeError(errorFor("F r"))).toBe(
			"Move 2 'r' is not supported. Use the capital letters U, D, L, R, F or B.",
		);
	});

	it("explains how to write a bad suffix", () => {
		expect(describeError(errorFor("U F1"))).toBe(
			"Move 2 'F1' is not valid. Write it F, F', F2 or F3 (a repeat from 2 to 9).",
		);
	});

	it("points at a curly apostrophe", () => {
		expect(describeError(errorFor("R U’"))).toBe(
			"Move 2 'U’' is not valid. Write it U, U', U2 or U3 (a repeat from 2 to 9).",
		);
	});
});
