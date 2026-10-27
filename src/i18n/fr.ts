import type { Translation } from "./types";

const plural = (count: number, word: string): string =>
	`${count} ${word}${count > 1 ? "s" : ""}`;

export const fr: Translation = {
	htmlLang: "fr",
	nativeName: "Français",
	ui: {
		moveSequenceLabel: "Suite de mouvements",
		sequenceHint:
			"Mouvements U D L R F B M E S, chacun suivi éventuellement de ' (sens anti-horaire) ou d'une répétition 2 ou 3 (L3 = L trois fois), séparés par des espaces.",
		optionsLegend: "Options",
		showFinalState: "Afficher l'état final",
		finalStateHint: "Ajoute un dernier cube après la dernière étape.",
		startingPosition: "Position de départ",
		topColor: "Couleur du dessus",
		frontColor: "Couleur de face",
		resetOrientation: "Rétablir l'orientation par défaut",
		startingSequenceLabel: "Suite de départ (mélange)",
		startingSequenceHint:
			"Appliquée au cube résolu avant l'étape 1. Ses mouvements ne sont pas dessinés.",
		tryExample: "Essayer l'exemple",
		downloadPdf: "Télécharger le PDF",
		generating: "Génération…",
		sheetPreview: "Aperçu de la feuille",
		colors: {
			white: "Blanc",
			yellow: "Jaune",
			green: "Vert",
			blue: "Bleu",
			red: "Rouge",
			orange: "Orange",
		},
		steps: (count) => plural(count, "étape"),
		pages: (count) => plural(count, "page"),
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `dessus ${top}, face ${front}`,
		startAfter: (notations) => `après ${notations}`,
		startSummary: (parts) => ` · Départ : ${parts.join(", ")}`,
		frontColorChanged: (color) => `Couleur de face changée en ${color}.`,
		enterMoves: "Saisissez une suite de mouvements pour commencer.",
		fixSequence: "Corrigez la suite pour voir l'aperçu.",
		previewOutdated: (stepCount) =>
			`L'aperçu n'est plus à jour. ${plural(stepCount, "étape")} affichée${stepCount > 1 ? "s" : ""}.`,
		enterSequenceToDownload: "Saisissez une suite pour télécharger.",
		fixMove: (position) =>
			`Corrigez le mouvement ${position} pour télécharger.`,
		fixStartMove: (position) =>
			`Corrigez le mouvement ${position} de la suite de départ pour télécharger.`,
		pdfSaved: (filename) => `PDF enregistré sous ${filename}.`,
		pdfFailed: "Le PDF n'a pas pu être généré. Réessayez.",
		pageLabel: (page, total, steps) => `Page ${page} sur ${total} : ${steps}`,
		finalStateWord: "état final",
		startingSequenceError: (error) => `Suite de départ : ${error}`,
		languageNavLabel: "Langue",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`Le mouvement ${position} '${token}' n'est pas valide. Écrivez-le ${face}, ${face}', ${face}2 ou ${face}3 (une répétition de 2 ou 3).`,
		lowercase: (position, token) =>
			`Le mouvement ${position} '${token}' n'est pas pris en charge. Utilisez les lettres majuscules U, D, L, R, F, B, M, E ou S.`,
		notAFace: (position, token) =>
			`Le mouvement ${position} '${token}' n'est pas une face du cube. Utilisez U, D, L, R, F, B, M, E ou S.`,
	},
	page: {
		title: "Étapes de Rubik's Cube en PDF – Cubing Steps Generator",
		description:
			"Générateur gratuit d'algorithme de Rubik's Cube en PDF : saisissez des mouvements comme F L F U' R U et obtenez des étapes à imprimer. Dans votre navigateur.",
		ogImageAlt:
			"Quatre étapes numérotées de Rubik's Cube, chacune montrant le cube avec une flèche sur la couche à tourner",
		h1: "Étapes de Rubik's Cube en PDF : Cubing Steps Generator",
		structuredDescription:
			"Transforme une suite de mouvements de Rubik's Cube en PDF imprimable d'étapes numérotées avec des flèches.",
		howTitle: "Comment ça marche",
		howText:
			"Cubing Steps Generator est un outil en ligne gratuit qui transforme une suite de mouvements de Rubik's Cube (un algorithme ou une solution complète) en PDF imprimable d'étapes numérotées et illustrées, pratique pour les tutoriels, l'enseignement ou pour partager une résolution avec d'autres speedcubers. Chaque étape montre le cube avant le mouvement, avec une flèche sur la couche à tourner. Les rotations répétées portent un marqueur rouge x2 ou x3.",
		notationTitle: "Notation des mouvements",
		notationText:
			"Écrivez les faces U (haut), D (bas), L (gauche), R (droite), F (avant) et B (arrière), ou les couches centrales M (milieu, entre L et R, tourne comme L), E (équateur, entre U et D, tourne comme D) et S (standing, entre F et B, tourne comme F), séparées par des espaces. Une rotation se fait dans le sens horaire par défaut ; ajoutez une apostrophe pour le sens anti-horaire (U'), ou un 2 ou un 3 pour la répéter (L2, L3). C'est la notation standard du cube 3x3. Exemple : F L F U' R U F2 L2 U'.",
		faqTitle: "Questions",
		faq: [
			{
				question: "Le PDF est-il généré sur un serveur ?",
				answer:
					"Non. La feuille est construite dans votre navigateur et rien n'est envoyé, vos suites restent donc privées.",
			},
			{
				question: "Quelle peut être la longueur d'une suite ?",
				answer:
					"Aucune limite. Une page contient jusqu'à 30 étapes, et les suites plus longues continuent sur de nouvelles pages A4.",
			},
			{
				question: "Puis-je partir d'un cube mélangé ?",
				answer:
					"Oui. Choisissez l'orientation de départ, indiquez une suite de départ, et ajoutez un cube d'état final après la dernière étape.",
			},
		],
	},
};
