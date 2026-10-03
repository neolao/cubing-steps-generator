import { describe, expect, it } from "vitest";
import { parseSequence } from "../src/moves";

describe("parseSequence", () => {
	it("splits a text sequence into moves", () => {
		expect(parseSequence("F L F U' L2")).toEqual(["F", "L", "F", "U'", "L2"]);
	});

	it("returns an empty list when input is blank", () => {
		expect(parseSequence("   ")).toEqual([]);
	});

	it("rejects an unknown move", () => {
		expect(() => parseSequence("F X")).toThrow("Invalid move: X");
	});
});
