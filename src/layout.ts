import type { Move } from "./moves";
import { CUBE_BOUNDS } from "./render";

/** A4 portrait at 300 dpi; the margin stays clear of the printers' unprintable border. */
export const PAGE = { width: 2481, height: 3508, margin: 120 };
export const MIN_COLUMNS = 3;
export const MAX_COLUMNS = 5;
export const MAX_STEPS_PER_PAGE = 30;

/** Rows of the reference sheet: sheets with fewer steps keep the same cube size. */
const REFERENCE_ROWS = 5;
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

interface Grid extends SizeRule {
	columns: number;
	rows: number;
	cellWidth: number;
	cellHeight: number;
}

function fitSize(
	cellWidth: number,
	cellHeight: number,
	maxScale: number,
): SizeRule {
	const widthLimit = (cellWidth * 0.9) / CUBE_WIDTH;
	const withMinFont =
		((cellHeight - MIN_FONT_SIZE * LABEL_BLOCK) * CELL_FILL) / CUBE_HEIGHT;
	const heightLimit =
		FONT_PER_SCALE * withMinFont <= MIN_FONT_SIZE
			? withMinFont
			: cellHeight / (CUBE_HEIGHT / CELL_FILL + FONT_PER_SCALE * LABEL_BLOCK);
	const scale = Math.min(heightLimit, widthLimit, maxScale);
	return { scale, fontSize: Math.max(MIN_FONT_SIZE, FONT_PER_SCALE * scale) };
}

function gridFor(columns: number, rows: number, maxScale: number): Grid {
	const cellWidth = (PAGE.width - 2 * PAGE.margin) / columns;
	const cellHeight = (PAGE.height - 2 * PAGE.margin) / rows;
	return {
		columns,
		rows,
		cellWidth,
		cellHeight,
		...fitSize(cellWidth, cellHeight, maxScale),
	};
}

/** The reference sheet (3 columns, 5 rows) sets the largest cube size. */
const REFERENCE_SCALE = gridFor(
	MIN_COLUMNS,
	REFERENCE_ROWS,
	Number.POSITIVE_INFINITY,
).scale;

/** Picks the column count that gives the largest cubes; ties keep fewer columns. */
function bestGrid(stepsOnPage: number): Grid {
	let best: Grid | null = null;
	for (let columns = MIN_COLUMNS; columns <= MAX_COLUMNS; columns++) {
		const rows = Math.max(REFERENCE_ROWS, Math.ceil(stepsOnPage / columns));
		const grid = gridFor(columns, rows, REFERENCE_SCALE);
		if (!best || grid.scale > best.scale + 1e-9) {
			best = grid;
		}
	}
	return best as Grid;
}

export function layoutSheet(moves: readonly Move[]): PageLayout[] {
	const { columns, cellWidth, cellHeight, scale, fontSize } = bestGrid(
		Math.min(moves.length, MAX_STEPS_PER_PAGE),
	);
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
				const column = i % columns;
				const row = Math.floor(i / columns);
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
