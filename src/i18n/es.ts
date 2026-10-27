import type { Translation } from "./types";

const plural = (count: number, singular: string, pluralForm: string): string =>
	`${count} ${count === 1 ? singular : pluralForm}`;

export const es: Translation = {
	htmlLang: "es",
	nativeName: "Español",
	ui: {
		moveSequenceLabel: "Secuencia de movimientos",
		sequenceHint:
			"Movimientos U D L R F B M E S, cada uno seguido opcionalmente de ' (antihorario) o de una repetición 2 o 3 (L3 = L tres veces), separados por espacios.",
		optionsLegend: "Opciones",
		showFinalState: "Mostrar el estado final",
		finalStateHint: "Añade un último cubo después del último paso.",
		startingPosition: "Posición inicial",
		topColor: "Color de arriba",
		frontColor: "Color del frente",
		resetOrientation: "Restablecer la orientación por defecto",
		startingSequenceLabel: "Secuencia inicial (mezcla)",
		startingSequenceHint:
			"Se aplica al cubo resuelto antes del paso 1. Sus movimientos no se dibujan.",
		tryExample: "Probar un ejemplo",
		downloadPdf: "Descargar PDF",
		generating: "Generando…",
		sheetPreview: "Vista previa de la hoja",
		colors: {
			white: "Blanco",
			yellow: "Amarillo",
			green: "Verde",
			blue: "Azul",
			red: "Rojo",
			orange: "Naranja",
		},
		steps: (count) => plural(count, "paso", "pasos"),
		pages: (count) => plural(count, "página", "páginas"),
		summary: (steps, pages, start) => `${steps} · ${pages}${start}`,
		startOrientation: (top, front) => `arriba ${top}, frente ${front}`,
		startAfter: (notations) => `después de ${notations}`,
		startSummary: (parts) => ` · Inicio: ${parts.join(", ")}`,
		frontColorChanged: (color) => `El color del frente cambió a ${color}.`,
		enterMoves: "Escribe una secuencia de movimientos para empezar.",
		fixSequence: "Corrige la secuencia para ver la vista previa.",
		previewOutdated: (stepCount) =>
			`La vista previa está desactualizada. Se muestran ${plural(stepCount, "paso", "pasos")}.`,
		enterSequenceToDownload: "Escribe una secuencia para descargar.",
		fixMove: (position) => `Corrige el movimiento ${position} para descargar.`,
		fixStartMove: (position) =>
			`Corrige el movimiento ${position} de la secuencia inicial para descargar.`,
		pdfSaved: (filename) => `PDF guardado como ${filename}.`,
		pdfFailed: "No se pudo generar el PDF. Inténtalo de nuevo.",
		pageLabel: (page, total, steps) => `Página ${page} de ${total}: ${steps}`,
		finalStateWord: "estado final",
		startingSequenceError: (error) => `Secuencia inicial: ${error}`,
		languageNavLabel: "Idioma",
	},
	errors: {
		badSuffix: (position, token, face) =>
			`El movimiento ${position} '${token}' no es válido. Escríbelo ${face}, ${face}', ${face}2 o ${face}3 (una repetición de 2 o 3).`,
		lowercase: (position, token) =>
			`El movimiento ${position} '${token}' no es compatible. Usa las letras mayúsculas U, D, L, R, F, B, M, E o S.`,
		notAFace: (position, token) =>
			`El movimiento ${position} '${token}' no es una cara del cubo. Usa U, D, L, R, F, B, M, E o S.`,
	},
	page: {
		title: "Pasos del cubo de Rubik a PDF – Cubing Steps Generator",
		description:
			"Algoritmo del cubo de Rubik a PDF, gratis: escribe movimientos como F L F U' R U y obtén pasos ilustrados con flechas para imprimir. Funciona en tu navegador.",
		ogImageAlt:
			"Cuatro pasos numerados del cubo de Rubik, cada uno con el cubo y una flecha sobre la capa que hay que girar",
		h1: "Pasos del cubo de Rubik a PDF: Cubing Steps Generator",
		structuredDescription:
			"Convierte una secuencia de movimientos del cubo de Rubik en un PDF imprimible con pasos numerados y flechas.",
		howTitle: "Cómo funciona",
		howText:
			"Cubing Steps Generator es una herramienta gratuita en línea que convierte una secuencia de movimientos del cubo de Rubik (un algoritmo o una solución completa) en un PDF imprimible de pasos numerados e ilustrados, útil para tutoriales, para enseñar o para compartir una resolución con otros speedcubers. Cada paso muestra el cubo antes del movimiento, con una flecha sobre la capa que hay que girar. Los giros repetidos llevan un marcador rojo x2 o x3.",
		notationTitle: "Notación de movimientos",
		notationText:
			"Escribe las caras U (arriba), D (abajo), L (izquierda), R (derecha), F (frente) y B (atrás), o las capas centrales M (medio, entre L y R, gira como L), E (ecuador, entre U y D, gira como D) y S (de pie, entre F y B, gira como F), separadas por espacios. Un giro es horario por defecto; añade un apóstrofo para hacerlo antihorario (U'), o un 2 o un 3 para repetirlo (L2, L3). Es la notación estándar del cubo 3x3. Ejemplo: F L F U' R U F2 L2 U'.",
		faqTitle: "Preguntas",
		faq: [
			{
				question: "¿El PDF se genera en un servidor?",
				answer:
					"No. La hoja se crea en tu navegador y no se sube nada, así que tus secuencias siguen siendo privadas.",
			},
			{
				question: "¿Qué longitud puede tener una secuencia?",
				answer:
					"Cualquiera. Una página admite hasta 30 pasos y las secuencias más largas continúan en nuevas páginas A4.",
			},
			{
				question: "¿Puedo partir de un cubo mezclado?",
				answer:
					"Sí. Elige la orientación inicial, indica una secuencia inicial y añade un cubo con el estado final después del último paso.",
			},
		],
	},
};
