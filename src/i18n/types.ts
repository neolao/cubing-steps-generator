import type { Color } from "../cube";

/**
 * Every user-facing text of the app for one language. Texts with a parameter
 * or a plural are functions returning the whole sentence, so each language
 * controls its own word order and plural forms. The move letters U D L R F B
 * M E S and the marks ' 2 3 are never translated.
 */
export interface Translation {
	htmlLang: string;
	nativeName: string;
	ui: {
		moveSequenceLabel: string;
		sequenceHint: string;
		optionsLegend: string;
		showFinalState: string;
		finalStateHint: string;
		startingPosition: string;
		topColor: string;
		frontColor: string;
		resetOrientation: string;
		startingSequenceLabel: string;
		startingSequenceHint: string;
		tryExample: string;
		downloadPdf: string;
		generating: string;
		sheetPreview: string;
		colors: Record<Color, string>;
		/** "6 steps" */
		steps: (count: number) => string;
		/** "2 pages" */
		pages: (count: number) => string;
		/** "6 steps · 2 pages" followed by the start text, which may be "". */
		summary: (steps: string, pages: string, start: string) => string;
		/** "top White, front Green" */
		startOrientation: (top: string, front: string) => string;
		/** "after R U" */
		startAfter: (notations: string) => string;
		/** " · Start: top White, front Green, after R U" from its non-empty parts. */
		startSummary: (parts: string[]) => string;
		frontColorChanged: (color: string) => string;
		enterMoves: string;
		fixSequence: string;
		previewOutdated: (stepCount: number) => string;
		enterSequenceToDownload: string;
		fixMove: (position: number) => string;
		fixStartMove: (position: number) => string;
		pdfSaved: (filename: string) => string;
		pdfFailed: string;
		/** Accessible name of a sheet page; `steps` lists the notations and the final state word. */
		pageLabel: (page: number, total: number, steps: string) => string;
		finalStateWord: string;
		/** Prefix of a starting sequence error: wraps the described error. */
		startingSequenceError: (error: string) => string;
		languageNavLabel: string;
	};
	errors: {
		badSuffix: (position: number, token: string, face: string) => string;
		lowercase: (position: number, token: string) => string;
		notAFace: (position: number, token: string) => string;
	};
	/** Text of the static page: search engine tags, title and the indexable explanation. */
	page: {
		/** 10–60 characters. */
		title: string;
		/** 40–160 characters (70 or more for languages written with spaces). */
		description: string;
		ogImageAlt: string;
		h1: string;
		/** One sentence for the structured data. */
		structuredDescription: string;
		howTitle: string;
		howText: string;
		notationTitle: string;
		notationText: string;
		faqTitle: string;
		faq: readonly [FaqEntry, FaqEntry, FaqEntry];
	};
}

export interface FaqEntry {
	question: string;
	answer: string;
}
