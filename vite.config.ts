import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { LANGS, LANGUAGES } from "./src/i18n/index";

export default defineConfig({
	base: "./",
	build: {
		rollupOptions: {
			input: LANGS.map((lang) =>
				resolve(import.meta.dirname, LANGUAGES[lang].path, "index.html"),
			),
		},
	},
	test: {
		// svg2pdf.js "main" is a UMD build expecting a global jsPDF; use its ES build like Vite does.
		alias: { "svg2pdf.js": "svg2pdf.js/dist/svg2pdf.es.js" },
	},
});
