// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { type Move, parseSequence } from "../src/moves";
import { buildPdf } from "../src/pdf";
import { renderSheet } from "../src/sheet";

function moves(notation: string): Move[] {
	const parsed = parseSequence(notation);
	if (!parsed.ok) {
		throw new Error(`bad test sequence ${notation}`);
	}
	return parsed.moves;
}

// jsdom does not lay out text: give svg2pdf the one measurement it asks for.
(SVGElement.prototype as unknown as { getBBox: () => object }).getBBox =
	() => ({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});

const asText = (bytes: Uint8Array) => new TextDecoder("latin1").decode(bytes);
const pageCount = (pdf: string) =>
	(pdf.match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

describe("buildPdf", () => {
	it("produces a PDF with one A4 page for the reference sequence", async () => {
		const bytes = await buildPdf(
			renderSheet(moves("F L F U' R U F2 L2 U' L' B D' B' L2 U")),
		);
		const pdf = asText(bytes);
		expect(pdf.startsWith("%PDF-")).toBe(true);
		expect(pageCount(pdf)).toBe(1);
		expect(pdf).toMatch(/\/MediaBox\s*\[\s*0\s+0\s+595\.2\d*\s+841\.8\d*\s*\]/);
	});

	it("keeps the sheet as vector drawing with the step labels as text", async () => {
		const pdf = asText(await buildPdf(renderSheet(moves("F L F"))));
		expect(pdf).not.toContain("/Subtype /Image");
		expect(pdf).toContain("(#1 - F)");
		expect(pdf).toContain("(#2 - L)");
	});

	it("adds a page for every 30 steps", async () => {
		const long = Array.from({ length: 31 }, () => "R").join(" ");
		const pdf = asText(await buildPdf(renderSheet(moves(long))));
		expect(pageCount(pdf)).toBe(2);
	});

	it("produces one blank page for an empty sequence", async () => {
		const pdf = asText(await buildPdf(renderSheet([])));
		expect(pageCount(pdf)).toBe(1);
	});
});
