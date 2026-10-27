// @vitest-environment jsdom
// The page files (index.html, <lang>/index.html) and public/sitemap.xml are
// generated. To change their text, edit src/i18n/<lang>.ts, then run
// `npx vitest run -u` to rewrite them and commit the result.
import { afterEach, describe, expect, it } from "vitest";
import { LANGS, LANGUAGES, type Lang } from "../src/i18n";
import { en } from "../src/i18n/en";
import { renderPage, renderSitemap } from "../src/pages";

const file = (lang: Lang): string => `../${LANGUAGES[lang].path}index.html`;
const parse = (html: string): Document =>
	new DOMParser().parseFromString(html, "text/html");

describe("generated files", () => {
	for (const lang of LANGS) {
		it(`the ${lang} page matches its committed file`, async () => {
			await expect(renderPage(lang)).toMatchFileSnapshot(file(lang));
		});
	}

	it("the sitemap matches its committed file", async () => {
		await expect(renderSitemap()).toMatchFileSnapshot("../public/sitemap.xml");
	});
});

describe("renderPage", () => {
	const original = LANGUAGES.en.t;
	afterEach(() => {
		LANGUAGES.en.t = original;
	});

	it("loads the application script from /src/main.ts on every page", () => {
		for (const lang of LANGS) {
			const script = parse(renderPage(lang)).querySelector(
				'script[type="module"]',
			);
			expect(script?.getAttribute("src"), lang).toBe("/src/main.ts");
		}
	});

	it("escapes quotes, brackets and ampersands from the dictionary", () => {
		const nasty = `A "b" & 'c' <d>`;
		LANGUAGES.en.t = {
			...en,
			page: {
				...en.page,
				title: nasty,
				description: nasty,
				structuredDescription: `</script><b>${nasty}`,
				faq: [
					{ question: nasty, answer: nasty },
					en.page.faq[1],
					en.page.faq[2],
				],
			},
		};
		const html = renderPage("en");
		const doc = parse(html);
		expect(doc.title).toBe(nasty);
		expect(
			doc.querySelector('meta[name="description"]')?.getAttribute("content"),
		).toBe(nasty);
		expect(doc.querySelector("section.about h3")?.textContent).toBe(nasty);
		expect(doc.querySelectorAll("script")).toHaveLength(2);
		const data = JSON.parse(
			doc.querySelector('script[type="application/ld+json"]')?.textContent ??
				"",
		);
		expect(data.description).toBe(`</script><b>${nasty}`);
		expect(html).not.toContain(`content="${nasty}"`);
	});
});
