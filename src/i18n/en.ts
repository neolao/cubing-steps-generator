import type { Translation } from "./types";

const plural = (count: number, word: string): string =>
	`${count} ${word}${count === 1 ? "" : "s"}`;

export const en: Translation = {
	htmlLang: "en",
	nativeName: "English",
	ui: {
		moveSequenceLabel: "Move sequence",
		sequenceHint:
			"Moves U D L R F B M E S, each optionally followed by ' (counter-clockwise) or a repeat of 2 or 3 (L3 = L three times), separated by spaces.",
		optionsLegend: "Options",
		showFinalState: "Show final state",
		finalStateHint: "Adds one last cube after the final step.",
		startingPosition: "Starting position",
		topColor: "Top color",
		frontColor: "Front color",
		resetOrientation: "Reset to default orientation",
		startingSequenceLabel: "Starting sequence (scramble)",
		startingSequenceHint:
			"Applied to the solved cube before step 1. Its moves are not drawn.",
		tryExample: "Try example",
		downloadPdf: "Download PDF",
		generating: "Generating…",
		sheetPreview: "Sheet preview",
		colors: {
			white: "White",
			yellow: "Yellow",
			green: "Green",
			blue: "Blue",
			red: "Red",
			orange: "Orange",
		},
		steps: (count) => plural(count, "step"),
		pages: (count) => plural(count, "page"),
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `top ${top}, front ${front}`,
		startAfter: (notations) => `after ${notations}`,
		startSummary: (parts) => ` · Start: ${parts.join(", ")}`,
		frontColorChanged: (color) => `Front color changed to ${color}.`,
		enterMoves: "Enter a move sequence to start.",
		fixSequence: "Fix the sequence to see the preview.",
		previewOutdated: (stepCount) =>
			`Preview is out of date. ${plural(stepCount, "step")} shown.`,
		enterSequenceToDownload: "Enter a sequence to download.",
		fixMove: (position) => `Fix move ${position} to download.`,
		fixStartMove: (position) =>
			`Fix move ${position} of the starting sequence to download.`,
		pdfSaved: (filename) => `PDF saved as ${filename}.`,
		pdfFailed: "The PDF could not be generated. Try again.",
		pageLabel: (page, total, steps) => `Page ${page} of ${total}: ${steps}`,
		finalStateWord: "final state",
		startingSequenceError: (error) => `Starting sequence: ${error}`,
		languageNavLabel: "Language",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`Move ${position} '${token}' is not valid. Write it ${face}, ${face}', ${face}2 or ${face}3 (a repeat of 2 or 3).`,
		lowercase: (position, token) =>
			`Move ${position} '${token}' is not supported. Use the capital letters U, D, L, R, F, B, M, E or S.`,
		notAFace: (position, token) =>
			`Move ${position} '${token}' is not a cube face. Use U, D, L, R, F, B, M, E or S.`,
	},
	page: {
		title: "Rubik's Cube Steps to PDF – Cubing Steps Generator",
		description:
			"Free Rubik's Cube algorithm to PDF generator: type moves like F L F U' R U and get printable, illustrated solving steps with arrows. Runs in your browser.",
		ogImageAlt:
			"Four numbered Rubik's Cube steps, each showing the cube with an arrow on the layer to turn",
		h1: "Rubik's Cube steps to PDF: Cubing Steps Generator",
		structuredDescription:
			"Turn a Rubik's Cube move sequence into a printable PDF of numbered solving steps with arrows.",
		howTitle: "How it works",
		howText:
			"Cubing Steps Generator is a free online tool that turns a Rubik's Cube move sequence (an algorithm or a full solution) into a printable PDF of numbered, illustrated steps, handy for tutorials, teaching or sharing a solve with other speedcubers. Each step shows the cube before the move, with an arrow on the layer to turn. Repeated turns carry a red x2 or x3 marker.",
		notationTitle: "Move notation",
		notationText:
			"Write the faces U (up), D (down), L (left), R (right), F (front) and B (back), or the middle layers M (middle, between L and R, turning like L), E (equator, between U and D, turning like D) and S (standing, between F and B, turning like F), separated by spaces. A turn is clockwise by default; add an apostrophe for counter-clockwise (U'), or a 2 or 3 to repeat it (L2, L3). This is the standard 3x3 cube notation. Example: F L F U' R U F2 L2 U'.",
		faqTitle: "Questions",
		faq: [
			{
				question: "Is the PDF generated on a server?",
				answer:
					"No. The sheet is built in your browser and nothing is uploaded, so your sequences stay private.",
			},
			{
				question: "How long can a sequence be?",
				answer:
					"Any length. A page holds up to 30 steps, and longer sequences continue on new A4 pages.",
			},
			{
				question: "Can I start from a scrambled cube?",
				answer:
					"Yes. Choose the starting orientation, give a starting sequence, and add a final-state cube after the last step.",
			},
		],
	},
};
