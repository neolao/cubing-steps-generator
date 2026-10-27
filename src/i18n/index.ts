import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";
import type { Translation } from "./types";
import { zh } from "./zh";

export type Lang = "en" | "fr" | "es" | "it" | "zh" | "ja" | "ko";

/** Every language, English first. */
export const LANGS: readonly Lang[] = [
	"en",
	"fr",
	"es",
	"it",
	"zh",
	"ja",
	"ko",
];

/** Every language with the path of its page under the site root ("" for the root page). */
export const LANGUAGES: Record<Lang, { path: string; t: Translation }> = {
	en: { path: "", t: en },
	fr: { path: "fr/", t: fr },
	es: { path: "es/", t: es },
	it: { path: "it/", t: it },
	zh: { path: "zh/", t: zh },
	ja: { path: "ja/", t: ja },
	ko: { path: "ko/", t: ko },
};

/**
 * The translation for a `<html lang>` value, ignoring case: the exact value
 * first, then its language prefix ("fr-CA" gives French). English when
 * unknown or missing.
 */
export function translationFor(htmlLang: string | undefined): Translation {
	const code = (htmlLang ?? "").toLowerCase();
	const prefix = code.split(/[-_]/)[0];
	const entries = Object.values(LANGUAGES);
	const entry =
		entries.find(({ t }) => t.htmlLang.toLowerCase() === code) ??
		entries.find(({ t }) => t.htmlLang.toLowerCase().split("-")[0] === prefix);
	return (entry ?? LANGUAGES.en).t;
}
