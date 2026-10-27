// @vitest-environment jsdom
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANGS, LANGUAGES, type Lang } from "../src/i18n";

const SITE = "https://neolao.github.io/cubing-steps-generator/";
const read = (path: string): string => readFileSync(path, "utf8");
const pageFile = (lang: Lang): string => `${LANGUAGES[lang].path}index.html`;
const address = (lang: Lang): string => SITE + LANGUAGES[lang].path;
const load = (lang: Lang): Document =>
	new DOMParser().parseFromString(read(pageFile(lang)), "text/html");

const meta = (page: Document, selector: string): string | null =>
	page.querySelector(selector)?.getAttribute("content") ?? null;

const alternates = (page: Document): [string, string][] =>
	[...page.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => [
		link.getAttribute("hreflang") ?? "",
		link.getAttribute("href") ?? "",
	]);

const spaced: Lang[] = ["en", "fr", "es", "it"];

describe.each(LANGS)("search engine tags of the %s page", (lang) => {
	const page = load(lang);
	const t = LANGUAGES[lang].t;

	it("has a title between 10 and 60 characters", () => {
		expect(page.title.length).toBeGreaterThanOrEqual(10);
		expect(page.title.length).toBeLessThanOrEqual(60);
	});

	it("has a description of a useful length", () => {
		const description = meta(page, 'meta[name="description"]') ?? "";
		expect(description.length).toBeGreaterThanOrEqual(
			spaced.includes(lang) ? 70 : 40,
		);
		expect(description.length).toBeLessThanOrEqual(160);
	});

	it("points the canonical link, og:url and structured data at its own address", () => {
		const data = JSON.parse(
			page.querySelector('script[type="application/ld+json"]')?.textContent ??
				"null",
		);
		expect(
			page.querySelector('link[rel="canonical"]')?.getAttribute("href"),
		).toBe(address(lang));
		expect(meta(page, 'meta[property="og:url"]')).toBe(address(lang));
		expect(data.url).toBe(address(lang));
	});

	it("has Open Graph and Twitter tags with an absolute image address", () => {
		expect(meta(page, 'meta[property="og:title"]')).toBe(page.title);
		expect(meta(page, 'meta[property="og:description"]')).toBe(
			meta(page, 'meta[name="description"]'),
		);
		expect(meta(page, 'meta[property="og:type"]')).toBe("website");
		expect(meta(page, 'meta[property="og:image"]')).toBe(`${SITE}og-image.png`);
		expect(meta(page, 'meta[property="og:image:alt"]')).toBe(t.page.ogImageAlt);
		expect(meta(page, 'meta[name="twitter:card"]')).toBe("summary_large_image");
	});

	it("never forbids indexing", () => {
		expect(meta(page, 'meta[name="robots"]') ?? "").not.toMatch(
			/noindex|nofollow/,
		);
	});

	it("declares a free web application in the page language", () => {
		const data = JSON.parse(
			page.querySelector('script[type="application/ld+json"]')?.textContent ??
				"null",
		);
		expect(data["@type"]).toBe("WebApplication");
		expect(data.offers.price).toBe("0");
		expect(data.inLanguage).toBe(page.documentElement.lang);
		expect(page.documentElement.lang).toBe(t.htmlLang);
	});

	it("links icons that exist under public/ from the page folder", () => {
		const hrefs = [...page.querySelectorAll('link[rel*="icon"]')].map(
			(link) => link.getAttribute("href") ?? "",
		);
		expect(hrefs).toHaveLength(3);
		for (const href of hrefs) {
			const target = join("public", dirname(pageFile(lang)), href);
			expect(existsSync(target), target).toBe(true);
		}
	});

	it("lists the same hreflang alternates as every other page, itself included", () => {
		const list = alternates(page);
		expect(list).toHaveLength(8);
		expect(list).toEqual(alternates(load("en")));
		expect(list).toContainEqual([t.htmlLang, address(lang)]);
		expect(list).toContainEqual(["x-default", SITE]);
	});
});

describe.each(LANGS)("indexable text of the %s page", (lang) => {
	const page = load(lang);

	it("has exactly one main heading and several section headings", () => {
		expect(page.querySelectorAll("h1")).toHaveLength(1);
		expect(page.querySelectorAll("section.about h2").length).toBeGreaterThan(1);
	});

	it("has a language selector with a link per language, the own one current", () => {
		const links = [...page.querySelectorAll("nav.language-selector a")];
		expect(links.map((link) => link.textContent)).toEqual(
			LANGS.map((l) => LANGUAGES[l].t.nativeName),
		);
		const current = links.filter((link) => link.hasAttribute("aria-current"));
		expect(current.map((link) => link.getAttribute("lang"))).toEqual([
			LANGUAGES[lang].t.htmlLang,
		]);
	});
});

describe("English text", () => {
	const page = load("en");

	it("names the topic in the title", () => {
		expect(page.title).toMatch(/Rubik/i);
		expect(page.title).toMatch(/PDF/);
	});

	it("explains the notation and mentions the PDF in plain text", () => {
		const text = page.querySelector("section.about")?.textContent ?? "";
		expect(text).toMatch(/clockwise/);
		expect(text).toMatch(/M \(middle.*E \(equator.*S \(standing/s);
		expect(text).toMatch(/PDF/);
		expect(text).toMatch(/browser/);
	});
});

describe("files for crawlers", () => {
	it("ships every file the head refers to", () => {
		for (const file of [
			"favicon.svg",
			"favicon-48x48.png",
			"apple-touch-icon.png",
			"og-image.png",
			"robots.txt",
			"sitemap.xml",
		]) {
			expect(existsSync(`public/${file}`), file).toBe(true);
		}
	});

	it("allows every crawler and announces the sitemap", () => {
		const robots = read("public/robots.txt");
		expect(robots).toMatch(/^User-agent: \*$/m);
		expect(robots).not.toMatch(/^Disallow: \S/m);
		expect(robots).toContain(`Sitemap: ${SITE}sitemap.xml`);
	});

	it("lists exactly the seven page addresses in the sitemap", () => {
		const urls = [...read("public/sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)];
		expect(urls.map((match) => match[1])).toEqual(LANGS.map(address));
	});
});
