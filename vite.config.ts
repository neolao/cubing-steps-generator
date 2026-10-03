import { defineConfig } from "vitest/config";

export default defineConfig({
	base: "./",
	test: {
		// svg2pdf.js "main" is a UMD build expecting a global jsPDF; use its ES build like Vite does.
		alias: { "svg2pdf.js": "svg2pdf.js/dist/svg2pdf.es.js" },
	},
});
