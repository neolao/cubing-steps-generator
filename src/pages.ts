import { LANGS, LANGUAGES, type Lang } from "./i18n";

const SITE = "https://neolao.github.io/cubing-steps-generator/";
const SITEMAP_LASTMOD = "2026-10-27";
const SITE_NAME = "Cubing Steps Generator";

const escapeHtml = (text: string): string =>
	text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

/** Relative path from a page to the site root: "" for the root page, "../" for a language folder. */
const rootFrom = (lang: Lang): string => (LANGUAGES[lang].path ? "../" : "");

/** The structured data, indented to sit inside the script tag. */
function structuredData(lang: Lang): string {
	const { path, t } = LANGUAGES[lang];
	const data = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: SITE_NAME,
		url: SITE + path,
		description: t.page.structuredDescription,
		applicationCategory: "UtilitiesApplication",
		operatingSystem: "Any",
		browserRequirements: "Requires JavaScript",
		inLanguage: t.htmlLang,
		image: `${SITE}og-image.png`,
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	};
	return JSON.stringify(data, null, "\t")
		.replaceAll("<", "\\u003c")
		.split("\n")
		.map((line) => `\t\t\t${line}`)
		.join("\n");
}

/** The complete HTML page of one language. */
export function renderPage(lang: Lang): string {
	const { path, t } = LANGUAGES[lang];
	const url = SITE + path;
	const root = rootFrom(lang);
	const title = escapeHtml(t.page.title);
	const description = escapeHtml(t.page.description);

	const alternates = [
		...LANGS.map(
			(other) =>
				`<link rel="alternate" hreflang="${escapeHtml(LANGUAGES[other].t.htmlLang)}" href="${SITE + LANGUAGES[other].path}" />`,
		),
		`<link rel="alternate" hreflang="x-default" href="${SITE}" />`,
	];

	const links = LANGS.map((other) => {
		const { htmlLang, nativeName } = LANGUAGES[other].t;
		const current = other === lang ? ' aria-current="page"' : "";
		const href = `${root || "./"}${LANGUAGES[other].path}`;
		return `<a href="${href}" lang="${escapeHtml(htmlLang)}" hreflang="${escapeHtml(htmlLang)}"${current}>${escapeHtml(nativeName)}</a>`;
	});

	const faq = t.page.faq.flatMap((entry) => [
		`<h3>${escapeHtml(entry.question)}</h3>`,
		`<p>${escapeHtml(entry.answer)}</p>`,
	]);

	const indent = (depth: number, lines: string[]): string[] =>
		lines.map((line) => (line ? "\t".repeat(depth) + line : line));

	return [
		"<!doctype html>",
		`<html lang="${escapeHtml(t.htmlLang)}">`,
		"\t<head>",
		...indent(2, [
			'<meta charset="UTF-8" />',
			'<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
			`<title>${title}</title>`,
			`<meta name="description" content="${description}" />`,
			`<link rel="canonical" href="${url}" />`,
			...alternates,
			'<meta name="robots" content="index, follow" />',
			'<meta name="theme-color" content="#1f5fd6" />',
			"",
			'<meta property="og:type" content="website" />',
			`<meta property="og:site_name" content="${SITE_NAME}" />`,
			`<meta property="og:title" content="${title}" />`,
			`<meta property="og:description" content="${description}" />`,
			`<meta property="og:url" content="${url}" />`,
			`<meta property="og:image" content="${SITE}og-image.png" />`,
			'<meta property="og:image:width" content="1200" />',
			'<meta property="og:image:height" content="630" />',
			`<meta property="og:image:alt" content="${escapeHtml(t.page.ogImageAlt)}" />`,
			'<meta name="twitter:card" content="summary_large_image" />',
			"",
			`<link rel="icon" href="${root}favicon.svg" type="image/svg+xml" />`,
			`<link rel="icon" href="${root}favicon-48x48.png" type="image/png" sizes="48x48" />`,
			`<link rel="apple-touch-icon" href="${root}apple-touch-icon.png" />`,
			"",
			'<script type="application/ld+json">',
		]),
		structuredData(lang),
		"\t\t</script>",
		"\t</head>",
		"\t<body>",
		...indent(2, [
			'<header class="site-title">',
			`\t<h1>${escapeHtml(t.page.h1)}</h1>`,
			`\t<nav class="language-selector" aria-label="${escapeHtml(t.ui.languageNavLabel)}">`,
			...indent(3, links),
			"\t</nav>",
			"</header>",
			'<main id="app"></main>',
			'<section class="about">',
			...indent(1, [
				`<h2>${escapeHtml(t.page.howTitle)}</h2>`,
				`<p>${escapeHtml(t.page.howText)}</p>`,
				`<h2>${escapeHtml(t.page.notationTitle)}</h2>`,
				`<p>${escapeHtml(t.page.notationText)}</p>`,
				`<h2>${escapeHtml(t.page.faqTitle)}</h2>`,
				...faq,
			]),
			"</section>",
			'<script type="module" src="/src/main.ts"></script>',
		]),
		"\t</body>",
		"</html>",
		"",
	].join("\n");
}

/** The sitemap listing the page of every language. */
export function renderSitemap(): string {
	const entries = LANGS.map(
		(lang) =>
			`\t<url>\n\t\t<loc>${SITE + LANGUAGES[lang].path}</loc>\n\t\t<lastmod>${SITEMAP_LASTMOD}</lastmod>\n\t</url>`,
	);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}
