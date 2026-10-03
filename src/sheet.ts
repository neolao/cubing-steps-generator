import { applyMove, solvedCube } from "./cube";
import { layoutSheet, PAGE, type StepPlacement } from "./layout";
import type { Move } from "./moves";
import { buildScene, sceneToSvg } from "./render";

const FONT = "Arial, Helvetica, sans-serif";

const escapeText = (text: string): string =>
	text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function stepSvg(
	step: StepPlacement,
	cubeBefore: ReturnType<typeof solvedCube>,
): string {
	const scene = buildScene(cubeBefore, step.move);
	return (
		'<g data-role="step">' +
		`<text x="${step.labelX}" y="${step.labelY}" font-family="${FONT}" font-weight="bold" font-size="${step.fontSize}" fill="black">${escapeText(step.label)}</text>` +
		`<g transform="translate(${step.cubeX} ${step.cubeY}) scale(${step.scale})">${sceneToSvg(scene, `s${step.index}`)}</g>` +
		"</g>"
	);
}

/** One SVG document per A4 page: the cube before each move, with its arrow and label. */
export function renderSheet(moves: readonly Move[]): string[] {
	const states = [solvedCube()];
	for (const move of moves) {
		states.push(applyMove(states[states.length - 1] ?? solvedCube(), move));
	}
	return layoutSheet(moves).map(
		(page) =>
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE.width} ${PAGE.height}" width="${PAGE.width}" height="${PAGE.height}">` +
			`<rect x="0" y="0" width="${PAGE.width}" height="${PAGE.height}" fill="white"/>` +
			page.steps
				.map((step) => stepSvg(step, states[step.index - 1] ?? solvedCube()))
				.join("") +
			"</svg>",
	);
}
