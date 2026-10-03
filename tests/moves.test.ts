import { describe, expect, it } from "vitest";
import { parseSequence } from "../src/moves";

describe("parseSequence", () => {
	it("parses clockwise, counter-clockwise and half turns", () => {
		const result = parseSequence("F L' U2");
		expect(result).toEqual({
			ok: true,
			moves: [
				{ face: "F", turns: 1, notation: "F" },
				{ face: "L", turns: -1, notation: "L'" },
				{ face: "U", turns: 2, notation: "U2" },
			],
		});
	});

	it("accepts all six faces", () => {
		const result = parseSequence("U D L R F B");
		expect(result.ok && result.moves.map((m) => m.face)).toEqual([
			"U",
			"D",
			"L",
			"R",
			"F",
			"B",
		]);
	});

	it("tolerates extra spaces and line breaks", () => {
		const result = parseSequence("  F\n\nL   U'\t");
		expect(result.ok && result.moves.map((m) => m.notation)).toEqual([
			"F",
			"L",
			"U'",
		]);
	});

	it("returns an empty list for blank input", () => {
		expect(parseSequence("  \n ")).toEqual({ ok: true, moves: [] });
	});

	it("reports an unknown face with its 1-based position", () => {
		expect(parseSequence("F L X U")).toEqual({
			ok: false,
			error: { kind: "unknown-face", token: "X", position: 3 },
		});
	});

	it("rejects lowercase letters as unsupported moves", () => {
		const result = parseSequence("F r");
		expect(result).toEqual({
			ok: false,
			error: { kind: "unknown-face", token: "r", position: 2 },
		});
	});

	it.each(["F3", "F2'", "F''", "F22"])(
		"reports a bad suffix for %s",
		(token) => {
			expect(parseSequence(`U ${token}`)).toEqual({
				ok: false,
				error: { kind: "bad-suffix", token, position: 2 },
			});
		},
	);

	it("rejects a curly apostrophe", () => {
		expect(parseSequence("R U’")).toEqual({
			ok: false,
			error: { kind: "bad-suffix", token: "U’", position: 2 },
		});
	});

	it("reports only the first invalid token", () => {
		const result = parseSequence("X Y");
		expect(!result.ok && result.error.position).toBe(1);
	});
});
