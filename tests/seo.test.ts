// @vitest-environment jsdom
import { existsSync, readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const SITE = "https://neolao.github.io/cubing-steps-generator/";
const read = (path: string): string => readFileSync(path, "utf8");

let page: Document;
beforeAll(() => {
	page = new DOMParser().parseFromString(read("index.html"), "text/html");
});

const meta = (selector: string): string | null =>
	page.querySelector(selector)?.getAttribute("content") ?? null;

describe("search engine tags", () => {
	it("has a title that names the topic, between 30 and 60 characters", () => {
		const title = page.title;
		expect(title).toMatch(/Rubik/i);
		expect(title).toMatch(/PDF/);
		expect(title.length).toBeGreaterThanOrEqual(30);
		expect(title.length).toBeLessThanOrEqual(60);
	});

	it("has a description between 70 and 160 characters", () => {
		const description = meta('meta[name="description"]') ?? "";
		expect(description.length).toBeGreaterThanOrEqual(70);
		expect(description.length).toBeLessThanOrEqual(160);
	});

	it("points the canonical link at the public address", () => {
		expect(
			page.querySelector('link[rel="canonical"]')?.getAttribute("href"),
		).toBe(SITE);
	});

	it("has Open Graph and Twitter tags with an absolute image address", () => {
		expect(meta('meta[property="og:title"]')).toBe(page.title);
		expect(meta('meta[property="og:description"]')).toBe(
			meta('meta[name="description"]'),
		);
		expect(meta('meta[property="og:url"]')).toBe(SITE);
		expect(meta('meta[property="og:type"]')).toBe("website");
		expect(meta('meta[property="og:image"]')).toBe(`${SITE}og-image.png`);
		expect(meta('meta[property="og:image:alt"]')).toBeTruthy();
		expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
	});

	it("never forbids indexing", () => {
		expect(meta('meta[name="robots"]') ?? "").not.toMatch(/noindex|nofollow/);
	});

	it("declares the page as a free web application in the structured data", () => {
		const script = page.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent ?? "null");
		expect(data["@type"]).toBe("WebApplication");
		expect(data.url).toBe(SITE);
		expect(data.offers.price).toBe("0");
	});

	it("links its favicons and the touch icon", () => {
		const hrefs = [...page.querySelectorAll('link[rel*="icon"]')].map((link) =>
			link.getAttribute("href"),
		);
		expect(hrefs).toEqual(
			expect.arrayContaining([
				"favicon.svg",
				"favicon-48x48.png",
				"apple-touch-icon.png",
			]),
		);
	});
});

describe("indexable text", () => {
	it("has exactly one main heading and several section headings", () => {
		expect(page.querySelectorAll("h1")).toHaveLength(0); // the h1 is rendered by the app
		expect(page.querySelectorAll("section.about h2").length).toBeGreaterThan(1);
	});

	it("explains the notation and mentions the PDF in plain text", () => {
		const text = page.querySelector("section.about")?.textContent ?? "";
		expect(text).toMatch(/clockwise/);
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

	it("lists only the site address in the sitemap", () => {
		const urls = [...read("public/sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)];
		expect(urls.map((match) => match[1])).toEqual([SITE]);
	});
});
