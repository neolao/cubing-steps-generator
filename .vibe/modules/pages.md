# Module: pages
**Role:** Build-time generation of the static HTML page of each language and of the sitemap from the dictionaries; not loaded by the browser. The generated files are committed and checked by snapshot tests (decision 002).
**Files:** `src/pages.ts`, `index.html`, `fr/index.html`, `es/index.html`, `it/index.html`, `zh/index.html`, `ja/index.html`, `ko/index.html`, `public/sitemap.xml`
**Exports:** `renderPage(lang): string`, `renderSitemap(): string`
**Depends on:** `modules/i18n.md`
