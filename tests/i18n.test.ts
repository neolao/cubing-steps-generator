import { describe, expect, it } from "vitest";
import { LANGS, LANGUAGES, translationFor } from "../src/i18n";
import { en } from "../src/i18n/en";
import { fr } from "../src/i18n/fr";
import { ja } from "../src/i18n/ja";
import { ko } from "../src/i18n/ko";
import { zh } from "../src/i18n/zh";

describe("translationFor", () => {
	it("returns the English translation for en", () => {
		expect(translationFor("en")).toBe(en);
		expect(en.htmlLang).toBe("en");
		expect(LANGUAGES.en.path).toBe("");
	});

	it("falls back to English for an unknown language", () => {
		expect(translationFor("xx")).toBe(en);
	});

	it("falls back to English when the language is missing", () => {
		expect(translationFor(undefined)).toBe(en);
		expect(translationFor("")).toBe(en);
	});
});

describe("English translation", () => {
	it("builds whole sentences with plurals", () => {
		expect(en.ui.steps(1)).toBe("1 step");
		expect(en.ui.steps(2)).toBe("2 steps");
		expect(en.ui.pages(0)).toBe("0 pages");
		expect(en.ui.fixMove(3)).toBe("Fix move 3 to download.");
	});
});

const EXAMPLE = "F L F U' R U F2 L2 U'";
const spaced = ["en", "fr", "es", "it"];

/** Every string of a dictionary, including the results of its functions. */
function allTexts(lang: (typeof LANGS)[number]): string[] {
	const t = LANGUAGES[lang].t;
	const texts: string[] = [];
	const walk = (value: unknown): void => {
		if (typeof value === "string") texts.push(value);
		else if (Array.isArray(value)) value.forEach(walk);
		else if (value && typeof value === "object")
			Object.values(value).forEach(walk);
	};
	walk({ ...t, ui: { ...t.ui, steps: 0, pages: 0 } });
	for (const f of [t.ui.steps, t.ui.pages, t.ui.fixMove, t.ui.fixStartMove])
		texts.push(f(3));
	texts.push(t.ui.pdfSaved("a.pdf"), t.ui.previewOutdated(3));
	texts.push(t.ui.summary("a", "b", "c"), t.ui.startAfter("R U"));
	texts.push(t.ui.startOrientation("a", "b"), t.ui.startSummary(["a", "b"]));
	texts.push(t.ui.frontColorChanged("a"), t.ui.pageLabel(1, 2, "F"));
	texts.push(t.ui.startingSequenceError("a"));
	texts.push(t.errors.badSuffix(3, "F4", "F"), t.errors.lowercase(2, "x"));
	texts.push(t.errors.notAFace(5, "Q"));
	return texts;
}

describe("registered languages", () => {
	it("lists English first and every language of the registry once", () => {
		expect(LANGS[0]).toBe("en");
		expect([...LANGS].sort()).toEqual(Object.keys(LANGUAGES).sort());
		expect([...LANGS].sort()).toEqual(
			["en", "es", "fr", "it", "ja", "ko", "zh"].sort(),
		);
	});

	it("gives each language a unique non-empty htmlLang and a unique path", () => {
		const htmlLangs = LANGS.map((l) => LANGUAGES[l].t.htmlLang);
		const paths = LANGS.map((l) => LANGUAGES[l].path);
		expect(htmlLangs.every((h) => h !== "")).toBe(true);
		expect(new Set(htmlLangs).size).toBe(LANGS.length);
		expect(new Set(paths).size).toBe(LANGS.length);
		expect(LANGUAGES.en.path).toBe("");
		for (const l of LANGS.filter((x) => x !== "en"))
			expect(LANGUAGES[l].path).toBe(`${l}/`);
		expect(zh.htmlLang).toBe("zh-Hans");
	});

	describe.each(LANGS)("%s", (lang) => {
		const t = LANGUAGES[lang].t;

		it("has a title and a description of the right length", () => {
			expect(t.page.title.length).toBeGreaterThanOrEqual(10);
			expect(t.page.title.length).toBeLessThanOrEqual(60);
			expect(t.page.description.length).toBeGreaterThanOrEqual(
				spaced.includes(lang) ? 70 : 40,
			);
			expect(t.page.description.length).toBeLessThanOrEqual(160);
		});

		it("has three complete FAQ entries", () => {
			expect(t.page.faq).toHaveLength(3);
			for (const { question, answer } of t.page.faq) {
				expect(question.trim()).not.toBe("");
				expect(answer.trim()).not.toBe("");
			}
		});

		it("explains the notation with the example and all move letters", () => {
			expect(t.page.notationText).toContain(EXAMPLE);
			for (const letter of "UDLRFBMES")
				expect(t.page.notationText).toContain(letter);
		});

		it("includes the count in steps and pages", () => {
			for (const n of [0, 1, 2, 5]) {
				expect(t.ui.steps(n)).toContain(String(n));
				expect(t.ui.pages(n)).toContain(String(n));
			}
		});

		it("quotes the token, position and letters in move errors", () => {
			const bad = t.errors.badSuffix(3, "F4", "F");
			expect(bad).toContain("3");
			expect(bad).toContain("'F4'");
			for (const form of ["F2", "F'"]) expect(bad).toContain(form);
			const messages = [t.errors.lowercase(2, "x"), t.errors.notAFace(5, "Q")];
			expect(messages[0]).toContain("2");
			expect(messages[0]).toContain("'x'");
			expect(messages[1]).toContain("5");
			expect(messages[1]).toContain("'Q'");
			for (const m of messages)
				expect(m).toMatch(/U(, |、)D\1L\1R\1F\1B\1M\1E/);
		});

		it("includes the position in the fix messages", () => {
			expect(t.ui.fixMove(4)).toContain("4");
			expect(t.ui.fixStartMove(2)).toContain("2");
		});

		it("names the saved file verbatim", () => {
			expect(t.ui.pdfSaved("cubing-steps-3-moves.pdf")).toContain(
				"cubing-steps-3-moves.pdf",
			);
		});

		it("builds the page label with the numbers and steps verbatim", () => {
			const label = t.ui.pageLabel(1, 2, "F L");
			for (const part of ["1", "2", "F L"]) expect(label).toContain(part);
			const wide = t.ui.pageLabel(12, 34, "R");
			for (const part of ["12", "34", "R"]) expect(wide).toContain(part);
			expect(t.ui.finalStateWord.trim()).not.toBe("");
		});

		it.skipIf(lang === "en")(
			"translates the page label and the final state word",
			() => {
				expect(t.ui.pageLabel(1, 2, "F L")).not.toBe(
					en.ui.pageLabel(1, 2, "F L"),
				);
				expect(t.ui.finalStateWord).not.toBe(en.ui.finalStateWord);
			},
		);

		it("has no empty text and no typographic apostrophe after a move letter", () => {
			const texts = allTexts(lang);
			expect(texts.length).toBeGreaterThan(40);
			for (const text of texts) {
				expect(text.trim()).not.toBe("");
				expect(text).not.toMatch(/[UDLRFBMES]\u2019/);
			}
		});
	});

	it("uses the singular for 0 and 1 and the plural from 2 in French", () => {
		expect(fr.ui.steps(0)).toBe("0 étape");
		expect(fr.ui.steps(1)).toBe("1 étape");
		expect(fr.ui.steps(2)).toBe("2 étapes");
		expect(fr.ui.pages(1)).toBe("1 page");
		expect(fr.ui.pages(2)).toBe("2 pages");
	});

	it("keeps one form for every count in Chinese, Japanese and Korean", () => {
		for (const t of [zh, ja, ko]) {
			expect(t.ui.steps(2).replace("2", "1")).toBe(t.ui.steps(1));
			expect(t.ui.pages(2).replace("2", "1")).toBe(t.ui.pages(1));
		}
	});
});

describe("translationFor with registered languages", () => {
	it("matches each language by its htmlLang", () => {
		for (const l of LANGS)
			expect(translationFor(LANGUAGES[l].t.htmlLang)).toBe(LANGUAGES[l].t);
	});

	it("falls back to the language prefix of a regional code", () => {
		expect(translationFor("fr-CA")).toBe(fr);
		expect(translationFor("zh")).toBe(zh);
		expect(translationFor("zh-CN")).toBe(zh);
		expect(translationFor("ja_JP")).toBe(ja);
	});

	it("ignores case", () => {
		expect(translationFor("FR")).toBe(fr);
		expect(translationFor("zh-hans")).toBe(zh);
	});

	it("does not mistake an unknown language for a registered one", () => {
		expect(translationFor("xx")).toBe(en);
		expect(translationFor("fra")).toBe(en);
		expect(translationFor("-fr")).toBe(en);
	});
});
