import type { Translation } from "./types";

const plural = (count: number, one: string, many: string): string =>
	`${count} ${count === 1 ? one : many}`;

export const it: Translation = {
	htmlLang: "it",
	nativeName: "Italiano",
	ui: {
		moveSequenceLabel: "Sequenza di mosse",
		sequenceHint:
			"Mosse U D L R F B M E S, ciascuna seguita facoltativamente da ' (antiorario) o da una ripetizione 2 o 3 (L3 = L tre volte), separate da spazi.",
		optionsLegend: "Opzioni",
		showFinalState: "Mostra lo stato finale",
		finalStateHint: "Aggiunge un ultimo cubo dopo l'ultimo passaggio.",
		startingPosition: "Posizione iniziale",
		topColor: "Colore in alto",
		frontColor: "Colore davanti",
		resetOrientation: "Ripristina l'orientamento predefinito",
		startingSequenceLabel: "Sequenza iniziale (mescolamento)",
		startingSequenceHint:
			"Applicata al cubo risolto prima del passaggio 1. Le sue mosse non vengono disegnate.",
		tryExample: "Prova un esempio",
		downloadPdf: "Scarica il PDF",
		generating: "Generazione in corso…",
		sheetPreview: "Anteprima del foglio",
		colors: {
			white: "Bianco",
			yellow: "Giallo",
			green: "Verde",
			blue: "Blu",
			red: "Rosso",
			orange: "Arancione",
		},
		steps: (count) => plural(count, "passaggio", "passaggi"),
		pages: (count) => plural(count, "pagina", "pagine"),
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `in alto ${top}, davanti ${front}`,
		startAfter: (notations) => `dopo ${notations}`,
		startSummary: (parts) => ` · Inizio: ${parts.join(", ")}`,
		frontColorChanged: (color) => `Il colore davanti è diventato ${color}.`,
		enterMoves: "Inserisci una sequenza di mosse per iniziare.",
		fixSequence: "Correggi la sequenza per vedere l'anteprima.",
		previewOutdated: (stepCount) =>
			`L'anteprima non è aggiornata. Mostra ${plural(stepCount, "passaggio", "passaggi")}.`,
		enterSequenceToDownload: "Inserisci una sequenza per scaricare il PDF.",
		fixMove: (position) =>
			`Correggi la mossa ${position} per scaricare il PDF.`,
		fixStartMove: (position) =>
			`Correggi la mossa ${position} della sequenza iniziale per scaricare il PDF.`,
		pdfSaved: (filename) => `PDF salvato come ${filename}.`,
		pdfFailed: "Non è stato possibile generare il PDF. Riprova.",
		pageLabel: (page, total, steps) => `Pagina ${page} di ${total}: ${steps}`,
		finalStateWord: "stato finale",
		startingSequenceError: (error) => `Sequenza iniziale: ${error}`,
		languageNavLabel: "Lingua",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`La mossa ${position} '${token}' non è valida. Scrivila ${face}, ${face}', ${face}2 o ${face}3 (una ripetizione di 2 o 3).`,
		lowercase: (position, token) =>
			`La mossa ${position} '${token}' non è supportata. Usa le lettere maiuscole U, D, L, R, F, B, M, E o S.`,
		notAFace: (position, token) =>
			`La mossa ${position} '${token}' non è una faccia del cubo. Usa U, D, L, R, F, B, M, E o S.`,
	},
	page: {
		title: "Passaggi del cubo di Rubik in PDF – Cubing Steps Generator",
		description:
			"Genera gratis un PDF dei passaggi del cubo di Rubik: scrivi le mosse di un algoritmo, come F L F U' R U, e stampa i passaggi con frecce. Funziona nel browser.",
		ogImageAlt:
			"Quattro passaggi numerati del cubo di Rubik, ciascuno con il cubo e una freccia sullo strato da girare",
		h1: "Passaggi del cubo di Rubik in PDF: Cubing Steps Generator",
		structuredDescription:
			"Trasforma una sequenza di mosse del cubo di Rubik in un PDF stampabile di passaggi numerati con frecce.",
		howTitle: "Come funziona",
		howText:
			"Cubing Steps Generator è uno strumento online gratuito che trasforma una sequenza di mosse del cubo di Rubik (un algoritmo o una soluzione completa) in un PDF stampabile di passaggi numerati e illustrati, utile per tutorial, lezioni o per condividere una risoluzione con altri speedcuber. Ogni passaggio mostra il cubo prima della mossa, con una freccia sullo strato da girare. Le rotazioni ripetute riportano un indicatore rosso x2 o x3.",
		notationTitle: "Notazione delle mosse",
		notationText:
			"Scrivi le facce U (alto), D (basso), L (sinistra), R (destra), F (davanti) e B (dietro), oppure gli strati centrali M (centrale, tra L e R, gira come L), E (equatore, tra U e D, gira come D) e S (standing, tra F e B, gira come F), separati da spazi. Una rotazione è oraria per impostazione predefinita; aggiungi un apostrofo per l'antiorario (U'), oppure un 2 o un 3 per ripeterla (L2, L3). È la notazione standard del cubo 3x3. Esempio: F L F U' R U F2 L2 U'.",
		faqTitle: "Domande frequenti",
		faq: [
			{
				question: "Il PDF viene generato su un server?",
				answer:
					"No. Il foglio viene creato nel tuo browser e non viene caricato nulla, quindi le tue sequenze restano private.",
			},
			{
				question: "Quanto può essere lunga una sequenza?",
				answer:
					"Qualsiasi lunghezza. Una pagina contiene fino a 30 passaggi e le sequenze più lunghe proseguono su nuove pagine A4.",
			},
			{
				question: "Posso partire da un cubo mescolato?",
				answer:
					"Sì. Scegli l'orientamento iniziale, indica una sequenza iniziale e aggiungi un cubo dello stato finale dopo l'ultimo passaggio.",
			},
		],
	},
};
