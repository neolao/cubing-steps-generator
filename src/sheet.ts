import { applyMove, type CubeState, solvedCube } from "./cube";
import { layoutSheet, PAGE, type StepPlacement } from "./layout";
import type { Move } from "./moves";
import { buildFinalScene, buildScene, sceneToSvg } from "./render";

const FONT = "Arial, Helvetica, sans-serif";

export interface SheetOptions {
	/** The cube before the first move; a solved cube by default. */
	start?: CubeState;
	/** Draws one more cube after the last move, without arrow. */
	finalState?: boolean;
}

const escapeText = (text: string): string =>
	text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function stepSvg(step: StepPlacement, cube: CubeState): string {
	const scene = step.move ? buildScene(cube, step.move) : buildFinalScene(cube);
	return (
		'<g data-role="step">' +
		`<text x="${step.labelX}" y="${step.labelY}" font-family="${FONT}" font-weight="bold" font-size="${step.fontSize}" fill="black">${escapeText(step.label)}</text>` +
		`<g transform="translate(${step.cubeX} ${step.cubeY}) scale(${step.scale})">${sceneToSvg(scene, `s${step.index}`)}</g>` +
		"</g>"
	);
}

/** One SVG document per A4 page: the cube before each move, with its arrow and label. */
export function renderSheet(
	moves: readonly Move[],
	{ start = solvedCube(), finalState = false }: SheetOptions = {},
): string[] {
	const states = [start];
	for (const move of moves) {
		states.push(applyMove(states[states.length - 1] ?? start, move));
	}
	return layoutSheet(moves, finalState).map(
		(page) =>
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE.width} ${PAGE.height}" width="${PAGE.width}" height="${PAGE.height}">` +
			`<rect x="0" y="0" width="${PAGE.width}" height="${PAGE.height}" fill="white"/>` +
			page.steps
				.map((step) => stepSvg(step, states[step.index - 1] ?? start))
				.join("") +
			"</svg>",
	);
}
