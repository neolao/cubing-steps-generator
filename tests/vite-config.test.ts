import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LANGS } from "../src/i18n/index";
import config from "../vite.config";

describe("vite build inputs", () => {
	it("builds exactly one existing index.html per registry language", () => {
		const input = config.build?.rollupOptions?.input as string[];
		const root = resolve(import.meta.dirname, "..");
		expect(input).toHaveLength(LANGS.length);
		expect(input.map((file) => file.slice(root.length + 1)).sort()).toEqual(
			[
				"index.html",
				"fr/index.html",
				"es/index.html",
				"it/index.html",
				"zh/index.html",
				"ja/index.html",
				"ko/index.html",
			].sort(),
		);
		for (const file of input) {
			expect(existsSync(file)).toBe(true);
		}
	});
});
