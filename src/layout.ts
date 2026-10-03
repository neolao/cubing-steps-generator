import type { Move } from "./moves";
import { CUBE_BOUNDS } from "./render";

/** A4 portrait at 300 dpi; the margin stays clear of the printers' unprintable border. */
export const PAGE = { width: 2481, height: 3508, margin: 120 };
export const COLUMNS = 3;
export const MAX_STEPS_PER_PAGE = 30;

/** Rows of the reference sheet: sheets with fewer steps keep the same cube size. */
const REFERENCE_ROWS = 5;
/** Largest cube, as on the reference sheet (cubie edge in px). */
const MAX_SCALE = 94.714;
/** 8 pt at 300 dpi. */
const MIN_FONT_SIZE = 34;
const FONT_PER_SCALE = 0.66;
const LABEL_BLOCK = 1.35;
const LABEL_BASELINE = 0.9;
const CELL_FILL = 0.94;
const CUBE_HEIGHT = 2 * CUBE_BOUNDS.halfHeight;
const CUBE_WIDTH = 2 * CUBE_BOUNDS.halfWidth;

export interface StepPlacement {
	/** 1-based position in the whole sequence. */
	index: number;
	move: Move;
	label: string;
	labelX: number;
	/** Text baseline. */
	labelY: number;
	fontSize: number;
	/** Center of the cube drawing. */
	cubeX: number;
	cubeY: number;
	/** Length of one cubie edge in px. */
	scale: number;
}

export interface PageLayout {
	steps: StepPlacement[];
}

interface SizeRule {
	scale: number;
	fontSize: number;
}

function fitSize(cellWidth: number, cellHeight: number): SizeRule {
	const widthLimit = (cellWidth * 0.9) / CUBE_WIDTH;
	const withMinFont =
		((cellHeight - MIN_FONT_SIZE * LABEL_BLOCK) * CELL_FILL) / CUBE_HEIGHT;
	if (FONT_PER_SCALE * withMinFont <= MIN_FONT_SIZE) {
		return {
			scale: Math.min(withMinFont, widthLimit),
			fontSize: MIN_FONT_SIZE,
		};
	}
	const proportional =
		cellHeight / (CUBE_HEIGHT / CELL_FILL + FONT_PER_SCALE * LABEL_BLOCK);
	const scale = Math.min(proportional, widthLimit, MAX_SCALE);
	return { scale, fontSize: Math.max(MIN_FONT_SIZE, FONT_PER_SCALE * scale) };
}

export function layoutSheet(moves: readonly Move[]): PageLayout[] {
	const rows =
		moves.length <= REFERENCE_ROWS * COLUMNS
			? REFERENCE_ROWS
			: Math.ceil(Math.min(moves.length, MAX_STEPS_PER_PAGE) / COLUMNS);
	const cellWidth = (PAGE.width - 2 * PAGE.margin) / COLUMNS;
	const cellHeight = (PAGE.height - 2 * PAGE.margin) / rows;
	const { scale, fontSize } = fitSize(cellWidth, cellHeight);
	const labelBlock = fontSize * LABEL_BLOCK;

	const pages: PageLayout[] = [];
	for (
		let start = 0;
		start === 0 || start < moves.length;
		start += MAX_STEPS_PER_PAGE
	) {
		const steps = moves
			.slice(start, start + MAX_STEPS_PER_PAGE)
			.map((move, i): StepPlacement => {
				const column = i % COLUMNS;
				const row = Math.floor(i / COLUMNS);
				const cellX = PAGE.margin + column * cellWidth;
				const cellY = PAGE.margin + row * cellHeight;
				return {
					index: start + i + 1,
					move,
					label: `#${start + i + 1} - ${move.notation}`,
					labelX: cellX,
					labelY: cellY + fontSize * LABEL_BASELINE,
					fontSize,
					cubeX: cellX + cellWidth / 2,
					cubeY: cellY + labelBlock + (cellHeight - labelBlock) / 2,
					scale,
				};
			});
		pages.push({ steps });
	}
	return pages;
}
