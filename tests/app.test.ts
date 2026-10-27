// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type AppDeps, EXAMPLE_SEQUENCE, mountApp } from "../src/app";
import { en } from "../src/i18n/en";
import { fr } from "../src/i18n/fr";
import { ja } from "../src/i18n/ja";
import type { Translation } from "../src/i18n/types";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(overrides: Partial<AppDeps> = {}, nav = "") {
	document.body.innerHTML = `${nav}<main id="app"></main>`;
	const deps: AppDeps = {
		buildPdf: vi.fn(async () => new Uint8Array([37, 80, 68, 70])),
		savePdf: vi.fn(),
		debounceMs: 0,
		t: en,
		search: "",
		...overrides,
	};
	mountApp(document.querySelector("#app") as HTMLElement, deps);
	const input = document.querySelector("#sequence") as HTMLTextAreaElement;
	const type = (text: string) => {
		input.value = text;
		input.dispatchEvent(new Event("input", { bubbles: true }));
	};
	const q = (selector: string) =>
		document.querySelector(selector) as HTMLElement;
	return { deps, input, type, q };
}

describe("empty state", () => {
	it("shows a labelled field, an example, a blank page and a disabled download with its reason", () => {
		const { q, input } = setup();
		expect(q('label[for="sequence"]').textContent).toBe("Move sequence");
		expect(input.placeholder).toBe(EXAMPLE_SEQUENCE);
		expect(q("#preview").querySelectorAll("svg")).toHaveLength(1);
		expect((q("#download") as HTMLButtonElement).disabled).toBe(true);
		expect(q("#download-reason").textContent).toBe(
			"Enter a sequence to download.",
		);
		expect(q("#summary").textContent).toBe("Enter a move sequence to start.");
	});

	it("tells which moves can be typed, including the middle layers", () => {
		const { q } = setup();
		expect(q("#sequence-hint").textContent).toContain("U D L R F B M E S");
	});

	it("turns off autocorrect and capitalization for the notation", () => {
		const { input } = setup();
		expect(input.getAttribute("autocapitalize")).toBe("off");
		expect(input.getAttribute("autocorrect")).toBe("off");
		expect(input.getAttribute("spellcheck")).toBe("false");
	});

	it("fills the field with the example when asked", () => {
		const { q, input } = setup();
		q("#example").click();
		expect(input.value).toBe(EXAMPLE_SEQUENCE);
		expect(q("#summary").textContent).toBe("15 steps · 1 page");
	});
});

describe("valid sequence", () => {
	it("updates the preview, the step count and enables the download", () => {
		const { q, type } = setup();
		type("F L F U' R U");
		expect(q("#summary").textContent).toBe("6 steps · 1 page");
		expect(q("#preview").textContent).toContain("#6 - U");
		expect((q("#download") as HTMLButtonElement).disabled).toBe(false);
		expect(q("#sequence-error").hidden).toBe(true);
		expect(q("#download-reason").hidden).toBe(true);
	});

	it("accepts line breaks and extra spaces", () => {
		const { q, type } = setup();
		type("F  L\n\nF");
		expect(q("#summary").textContent).toBe("3 steps · 1 page");
	});

	it("announces several pages for a long sequence", () => {
		const { q, type } = setup();
		type(Array.from({ length: 31 }, () => "R").join(" "));
		expect(q("#summary").textContent).toBe("31 steps · 2 pages");
		expect(q("#preview").querySelectorAll("svg")).toHaveLength(2);
	});

	it("keeps singular wording for one step", () => {
		const { q, type } = setup();
		type("F");
		expect(q("#summary").textContent).toBe("1 step · 1 page");
	});
});

describe("invalid sequence", () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => {
		ctx = setup();
		ctx.type("F L F");
		ctx.type("F L X U");
	});

	it("explains the error next to the field and links it to the input", () => {
		const { q, input } = ctx;
		expect(q("#sequence-error").hidden).toBe(false);
		expect(q("#sequence-error").textContent).toBe(
			"Move 3 'X' is not a cube face. Use U, D, L, R, F, B, M, E or S.",
		);
		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(input.getAttribute("aria-describedby")).toContain("sequence-error");
	});

	it("keeps the typed text and the last valid preview, marked as out of date", () => {
		const { q, input } = ctx;
		expect(input.value).toBe("F L X U");
		expect(q("#preview").textContent).toContain("#3 - F");
		expect(q("#preview").dataset.stale).toBe("true");
		expect(q("#summary").textContent).toBe(
			"Preview is out of date. 3 steps shown.",
		);
	});

	it("disables the download and says which move to fix", () => {
		const { q } = ctx;
		expect((q("#download") as HTMLButtonElement).disabled).toBe(true);
		expect(q("#download-reason").textContent).toBe("Fix move 3 to download.");
	});

	it("clears the error as soon as the sequence is fixed", () => {
		const { q, type, input } = ctx;
		type("F L U");
		expect(q("#sequence-error").hidden).toBe(true);
		expect(input.getAttribute("aria-invalid")).toBe("false");
		expect(q("#preview").dataset.stale).toBeUndefined();
		expect((q("#download") as HTMLButtonElement).disabled).toBe(false);
	});
});

describe("download", () => {
	it("generates the PDF of all pages and saves it with a meaningful name", async () => {
		const { deps, q, type } = setup();
		type("F L F");
		q("#download").click();
		await flush();
		expect(deps.buildPdf).toHaveBeenCalledTimes(1);
		const pages = (deps.buildPdf as ReturnType<typeof vi.fn>).mock
			.calls[0]?.[0] as string[];
		expect(pages).toHaveLength(1);
		expect(deps.savePdf).toHaveBeenCalledWith(
			expect.any(Uint8Array),
			"cubing-steps-3-moves.pdf",
		);
		expect(q("#download-status").textContent).toBe(
			"PDF saved as cubing-steps-3-moves.pdf.",
		);
	});

	it("shows a busy state and ignores a second click while generating", async () => {
		let release: (bytes: Uint8Array) => void = () => {};
		const buildPdf = vi.fn(
			() =>
				new Promise<Uint8Array>((resolve) => {
					release = resolve;
				}),
		);
		const { q, type } = setup({ buildPdf });
		type("F L");
		const button = q("#download") as HTMLButtonElement;
		button.click();
		expect(button.disabled).toBe(true);
		expect(button.getAttribute("aria-busy")).toBe("true");
		expect(button.textContent).toBe("Generating…");
		button.click();
		expect(buildPdf).toHaveBeenCalledTimes(1);
		release(new Uint8Array([1]));
		await flush();
		expect(button.disabled).toBe(false);
		expect(button.getAttribute("aria-busy")).toBe("false");
		expect(button.textContent).toBe("Download PDF");
	});

	it("explains a failure and lets the user retry", async () => {
		const buildPdf = vi
			.fn()
			.mockRejectedValueOnce(new Error("boom"))
			.mockResolvedValueOnce(new Uint8Array([1]));
		const { deps, q, type } = setup({ buildPdf });
		type("F");
		q("#download").click();
		await flush();
		expect(q("#download-status").textContent).toBe(
			"The PDF could not be generated. Try again.",
		);
		expect((q("#download") as HTMLButtonElement).disabled).toBe(false);
		q("#download").click();
		await flush();
		expect(deps.savePdf).toHaveBeenCalledTimes(1);
		expect(q("#download-status").textContent).toBe(
			"PDF saved as cubing-steps-1-moves.pdf.",
		);
	});

	it("does nothing while the sequence is invalid", async () => {
		const { deps, q, type } = setup();
		type("F X");
		q("#download").click();
		await flush();
		expect(deps.buildPdf).not.toHaveBeenCalled();
	});

	it("clears the previous status when the sequence changes", async () => {
		const { q, type } = setup();
		type("F");
		q("#download").click();
		await flush();
		type("F L");
		expect(q("#download-status").textContent).toBe("");
	});
});

const select = (el: HTMLElement, value: string) => {
	(el as HTMLSelectElement).value = value;
	el.dispatchEvent(new Event("change", { bubbles: true }));
};
const typeIn = (el: HTMLElement, text: string) => {
	(el as HTMLTextAreaElement).value = text;
	el.dispatchEvent(new Event("input", { bubbles: true }));
};
const options = (el: HTMLElement) =>
	[...el.querySelectorAll("option")].map((o) => o.value);

describe("default setup", () => {
	it("produces the same sheet as before when no option is touched", () => {
		const { q, type } = setup();
		type("F L");
		expect(q("#summary").textContent).toBe("2 steps · 1 page");
		expect((q("#orientation-top") as HTMLSelectElement).value).toBe("yellow");
		expect((q("#orientation-front") as HTMLSelectElement).value).toBe("green");
		expect((q("#start-sequence") as HTMLTextAreaElement).value).toBe("");
		expect((q("#final-state") as HTMLInputElement).checked).toBe(false);
		expect(q("#preview").textContent).not.toContain("Final state");
	});

	it("keeps the starting position collapsed", () => {
		const { q } = setup();
		expect((q("#start-details") as HTMLDetailsElement).open).toBe(false);
	});
});

describe("starting orientation", () => {
	it("offers only valid front colors for the chosen top color", () => {
		const { q } = setup();
		select(q("#orientation-top"), "white");
		expect(options(q("#orientation-front")).sort()).toEqual([
			"blue",
			"green",
			"orange",
			"red",
		]);
	});

	it("labels the colors with their names", () => {
		const { q } = setup();
		expect(q('label[for="orientation-top"]').textContent).toBe("Top color");
		expect(q('label[for="orientation-front"]').textContent).toBe("Front color");
		expect(
			[...q("#orientation-top").querySelectorAll("option")].map(
				(o) => o.textContent,
			),
		).toContain("White");
	});

	it("keeps the front color when it stays valid", () => {
		const { q } = setup();
		select(q("#orientation-top"), "white");
		expect((q("#orientation-front") as HTMLSelectElement).value).toBe("green");
		expect(q("#options-status").textContent).toBe("");
	});

	it("resets an invalid front color and announces it", () => {
		const { q } = setup();
		select(q("#orientation-top"), "red");
		select(q("#orientation-front"), "yellow");
		select(q("#orientation-top"), "yellow");
		expect((q("#orientation-front") as HTMLSelectElement).value).toBe("green");
		expect(q("#options-status").textContent).toBe(
			"Front color changed to Green.",
		);
	});

	it("draws the sheet in the chosen orientation and says so in the summary", () => {
		const { q, type } = setup();
		type("F");
		const before = q("#preview").innerHTML;
		select(q("#orientation-top"), "white");
		expect(q("#preview").innerHTML).not.toBe(before);
		expect(q("#summary").textContent).toBe(
			"1 step · 1 page · Start: top White, front Green",
		);
	});

	it("goes back to the default sheet with the reset button", () => {
		const { q, type } = setup();
		type("F");
		const before = q("#preview").innerHTML;
		select(q("#orientation-top"), "white");
		q("#orientation-reset").click();
		expect((q("#orientation-top") as HTMLSelectElement).value).toBe("yellow");
		expect((q("#orientation-front") as HTMLSelectElement).value).toBe("green");
		expect(q("#preview").innerHTML).toBe(before);
		expect(q("#summary").textContent).toBe("1 step · 1 page");
	});
});

describe("starting sequence", () => {
	it("starts the first cube from the scrambled state and does not draw its moves", () => {
		const { q, type } = setup();
		type("F");
		const plain = q("#preview").innerHTML;
		typeIn(q("#start-sequence"), "R U");
		expect(q("#preview").innerHTML).not.toBe(plain);
		expect(q("#preview").textContent).not.toContain("#2");
		expect(q("#summary").textContent).toBe(
			"1 step · 1 page · Start: after R U",
		);
	});

	it("combines orientation and scramble in the summary", () => {
		const { q, type } = setup();
		type("F");
		select(q("#orientation-top"), "white");
		typeIn(q("#start-sequence"), "R");
		expect(q("#summary").textContent).toBe(
			"1 step · 1 page · Start: top White, front Green, after R",
		);
	});

	it("explains an invalid move next to its field and opens the section", () => {
		const { q, type } = setup();
		type("F L");
		typeIn(q("#start-sequence"), "R X U");
		expect(q("#start-error").hidden).toBe(false);
		expect(q("#start-error").textContent).toBe(
			"Starting sequence: Move 2 'X' is not a cube face. Use U, D, L, R, F, B, M, E or S.",
		);
		expect(q("#start-sequence").getAttribute("aria-invalid")).toBe("true");
		expect(q("#start-sequence").getAttribute("aria-describedby")).toContain(
			"start-error",
		);
		expect((q("#start-details") as HTMLDetailsElement).open).toBe(true);
		expect(q("#sequence-error").hidden).toBe(true);
	});

	it("blocks the download, names the field to fix and marks the preview out of date", () => {
		const { q, type } = setup();
		type("F L");
		typeIn(q("#start-sequence"), "R X U");
		expect((q("#download") as HTMLButtonElement).disabled).toBe(true);
		expect(q("#download-reason").textContent).toBe(
			"Fix move 2 of the starting sequence to download.",
		);
		expect(q("#preview").dataset.stale).toBe("true");
		expect(q("#summary").textContent).toBe(
			"Preview is out of date. 2 steps shown.",
		);
	});

	it("clears the error once fixed and refreshes the preview", () => {
		const { q, type } = setup();
		type("F L");
		typeIn(q("#start-sequence"), "R X U");
		typeIn(q("#start-sequence"), "R U");
		expect(q("#start-error").hidden).toBe(true);
		expect(q("#preview").dataset.stale).toBeUndefined();
		expect((q("#download") as HTMLButtonElement).disabled).toBe(false);
	});

	it("keeps each field's error independent", () => {
		const { q, type } = setup();
		typeIn(q("#start-sequence"), "R X");
		type("F Y");
		expect(q("#sequence-error").hidden).toBe(false);
		expect(q("#start-error").hidden).toBe(false);
		typeIn(q("#start-sequence"), "R");
		expect(q("#start-error").hidden).toBe(true);
		expect(q("#sequence-error").hidden).toBe(false);
		expect(q("#preview").dataset.stale).toBe("true");
		expect(q("#download-reason").textContent).toBe("Fix move 2 to download.");
	});

	it("still needs a main sequence to download", () => {
		const { q } = setup();
		typeIn(q("#start-sequence"), "R U");
		(q("#final-state") as HTMLInputElement).click();
		expect((q("#download") as HTMLButtonElement).disabled).toBe(true);
		expect(q("#summary").textContent).toBe("Enter a move sequence to start.");
		expect(q("#preview").textContent).not.toContain("Final state");
	});
});

describe("final state", () => {
	it("adds a labelled cube without counting it as a step", () => {
		const { q, type } = setup();
		type("F L");
		(q("#final-state") as HTMLInputElement).click();
		expect(q("#preview").textContent).not.toContain("Final state");
		expect(q("#preview").querySelectorAll("text")).toHaveLength(2);
		expect(q("#summary").textContent).toBe("2 steps · 1 page");
		expect(q("#preview .page").getAttribute("aria-label")).toBe(
			"Page 1 of 1: F L final state",
		);
	});

	it("adds a second page after exactly 30 steps and counts it in the summary", () => {
		const { q, type } = setup();
		type(Array.from({ length: 30 }, () => "R").join(" "));
		(q("#final-state") as HTMLInputElement).click();
		expect(q("#summary").textContent).toBe("30 steps · 2 pages");
		expect(q("#preview").querySelectorAll("svg")).toHaveLength(2);
		const labels = [...q("#preview").querySelectorAll(".page")].map((p) =>
			p.getAttribute("aria-label"),
		);
		expect(labels[1]).toBe("Page 2 of 2: final state");
		(q("#final-state") as HTMLInputElement).click();
		expect(q("#summary").textContent).toBe("30 steps · 1 page");
	});

	it("downloads the sheet with the options applied and the move count in the name", async () => {
		const { q, type, deps } = setup();
		type("F L");
		typeIn(q("#start-sequence"), "R");
		(q("#final-state") as HTMLInputElement).click();
		q("#download").click();
		await flush();
		const pages = (deps.buildPdf as ReturnType<typeof vi.fn>).mock
			.calls[0]?.[0] as string[];
		expect(pages[0]).not.toContain("Final state");
		expect((deps.savePdf as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]).toBe(
			"cubing-steps-2-moves.pdf",
		);
	});
});

const NAV =
	'<nav class="language-selector"><a href="/">English</a><a href="/fr/">Français</a></nav>';
const hrefs = () =>
	Array.from(document.querySelectorAll("nav.language-selector a")).map((a) =>
		a.getAttribute("href"),
	);

const fake: Translation = {
	...en,
	ui: {
		...en.ui,
		moveSequenceLabel: "FAKE label",
		tryExample: 'Say "hi" it\'s <b>',
		sheetPreview: "Sheet \"x\" 'y'",
		steps: (n) => `${n} FAKESTEP`,
		pages: (n) => `${n} FAKEPAGE`,
		enterMoves: "FAKE enter",
		fixMove: (p) => `FAKE fix ${p}`,
		colors: { ...en.ui.colors, white: "Blanc" },
	},
	errors: {
		badSuffix: (p, tok, f) => `FAKE suffix ${p} ${tok} ${f}`,
		lowercase: (p, tok) => `FAKE lower ${p} ${tok}`,
		notAFace: (p, tok) => `FAKE face ${p} ${tok}`,
	},
};

describe("translation", () => {
	it("renders every text from the injected translation", () => {
		const { q, type } = setup({ t: fake });
		expect(q('label[for="sequence"]').textContent).toBe("FAKE label");
		expect(q("#summary").textContent).toBe("FAKE enter");
		expect(q('#orientation-top option[value="white"]').textContent).toBe(
			"Blanc",
		);
		type("F L");
		expect(q("#summary").textContent).toBe("2 FAKESTEP · 1 FAKEPAGE");
		type("F X");
		expect(q("#sequence-error").textContent).toBe("FAKE face 2 X");
		expect(q("#download-reason").textContent).toBe("FAKE fix 2");
	});

	it("keeps quotes and angle brackets in texts from breaking the markup", () => {
		const { q } = setup({ t: fake });
		expect(q("#example").textContent).toBe('Say "hi" it\'s <b>');
		expect(q("#example").querySelector("b")).toBeNull();
		expect(q(".sheet-area").getAttribute("aria-label")).toBe("Sheet \"x\" 'y'");
	});

	it("shows the translated error of an invalid starting sequence", () => {
		const { q } = setup({ t: fake, search: "?start=F%20X" });
		expect(q("#start-error").textContent).toBe(
			"Starting sequence: FAKE face 2 X",
		);
	});
});

describe("state carried by the query", () => {
	it("restores the fields from the query", () => {
		const { q, input } = setup({
			search: "?moves=F%20L%20U%27&start=R%20U&top=blue&front=white&final=1",
		});
		expect(input.value).toBe("F L U'");
		expect((q("#start-sequence") as HTMLTextAreaElement).value).toBe("R U");
		expect((q("#orientation-top") as HTMLSelectElement).value).toBe("blue");
		expect((q("#orientation-front") as HTMLSelectElement).value).toBe("white");
		expect((q("#final-state") as HTMLInputElement).checked).toBe(true);
		expect(q("#summary").textContent).toBe(
			"3 steps · 1 page · Start: top Blue, front White, after R U",
		);
	});

	it("shows the error of an invalid sequence given in the query", () => {
		const { q } = setup({ search: "?moves=F%20X" });
		expect(q("#sequence-error").textContent).toBe(
			"Move 2 'X' is not a cube face. Use U, D, L, R, F, B, M, E or S.",
		);
		expect((q("#download") as HTMLButtonElement).disabled).toBe(true);
	});

	it("falls back to the default orientation for an invalid pair", () => {
		const { q } = setup({ search: "?top=white&front=yellow" });
		expect((q("#orientation-top") as HTMLSelectElement).value).toBe("yellow");
		expect((q("#orientation-front") as HTMLSelectElement).value).toBe("green");
	});

	it("ignores unknown keys, unknown colors and an empty query", () => {
		const a = setup({ search: "?foo=bar&top=pink&front=green&final=0" });
		expect(a.input.value).toBe("");
		expect((a.q("#orientation-top") as HTMLSelectElement).value).toBe("yellow");
		expect((a.q("#final-state") as HTMLInputElement).checked).toBe(false);
		const b = setup({ search: "" });
		expect(b.q("#summary").textContent).toBe("Enter a move sequence to start.");
	});

	it("writes the non-default state into the language links", () => {
		const { q, type } = setup({}, NAV);
		expect(hrefs()).toEqual(["/", "/fr/"]);
		type("F U'  R");
		expect(hrefs()).toEqual([
			"/?moves=F%20U%27%20%20R",
			"/fr/?moves=F%20U%27%20%20R",
		]);
		(q("#final-state") as HTMLInputElement).click();
		(q("#start-sequence") as HTMLTextAreaElement).value = "L";
		q("#start-sequence").dispatchEvent(new Event("input", { bubbles: true }));
		const top = q("#orientation-top") as HTMLSelectElement;
		top.value = "blue";
		top.dispatchEvent(new Event("change", { bubbles: true }));
		expect(hrefs()[1]).toBe(
			"/fr/?moves=F%20U%27%20%20R&start=L&top=blue&front=yellow&final=1",
		);
		type("");
		(q("#final-state") as HTMLInputElement).click();
		(q("#start-sequence") as HTMLTextAreaElement).value = "";
		q("#orientation-reset").click();
		expect(hrefs()).toEqual(["/", "/fr/"]);
	});

	it("restores the query state into the links at mount", () => {
		setup({ search: "?moves=R%20U" }, NAV);
		expect(hrefs()).toEqual(["/?moves=R%20U", "/fr/?moves=R%20U"]);
	});

	it("works when the page has no language links", () => {
		expect(() => setup({ search: "?moves=R" })).not.toThrow();
	});
});

describe("page accessible name", () => {
	const labels = (q: (s: string) => HTMLElement) =>
		[...q("#preview").querySelectorAll(".page")].map((p) =>
			p.getAttribute("aria-label"),
		);

	it("is written in French with the French final state word", () => {
		const { q, type } = setup({ t: fr });
		type("F L");
		(q("#final-state") as HTMLInputElement).click();
		expect(labels(q)).toEqual(["Page 1 sur 1 : F L état final"]);
	});

	it("is written in Japanese with the Japanese final state word", () => {
		const { q, type } = setup({ t: ja });
		type("F L");
		(q("#final-state") as HTMLInputElement).click();
		expect(labels(q)).toEqual(["1 ページ中 1 ページ目: F L 最終状態"]);
	});

	it("numbers each page of a multi-page sequence in the page language", () => {
		const { q, type } = setup({ t: fr });
		type(Array.from({ length: 31 }, () => "R").join(" "));
		const result = labels(q);
		expect(result).toHaveLength(2);
		expect(result[0]).toMatch(/^Page 1 sur 2 : R /);
		expect(result[1]).toBe("Page 2 sur 2 : R");
	});

	it("uses the translation's pageLabel and finalStateWord", () => {
		const t: Translation = {
			...en,
			ui: {
				...en.ui,
				pageLabel: (page, total, steps) => `P${page}/${total}|${steps}`,
				finalStateWord: "END",
			},
		};
		const { q, type } = setup({ t });
		type("F L");
		(q("#final-state") as HTMLInputElement).click();
		expect(labels(q)).toEqual(["P1/1|F L END"]);
	});

	it("labels the single blank page of an empty sequence without failing", () => {
		const { q } = setup({ t: fr });
		expect(labels(q)).toEqual(["Page 1 sur 1 : "]);
	});
});
