import {
	applySequence,
	COLORS,
	type Color,
	type CubeState,
	DEFAULT_ORIENTATION,
	type Orientation,
	solvedCube,
	validFrontColors,
} from "./cube";
import { layoutSheet } from "./layout";
import { describeError } from "./messages";
import { type Move, parseSequence } from "./moves";
import { renderSheet } from "./sheet";

export const EXAMPLE_SEQUENCE = "F L F U' R U F2 L2 U' L' B D' B' L2 U";

export interface AppDeps {
	buildPdf: (pages: string[]) => Promise<Uint8Array>;
	savePdf: (bytes: Uint8Array, filename: string) => void;
	/** Delay between typing and updating the preview; 0 updates synchronously. */
	debounceMs: number;
}

/** What the sheet is drawn from: the moves and everything that shapes the first and last cubes. */
interface SheetSetup {
	moves: Move[];
	startMoves: Move[];
	orientation: Orientation;
	finalState: boolean;
}

const colorName = (color: Color): string =>
	color.charAt(0).toUpperCase() + color.slice(1);

const notations = (moves: readonly Move[]): string =>
	moves.map((move) => move.notation).join(" ");

/** The non-default starting position, for the summary ("" when it is the default). */
function describeStart({ startMoves, orientation }: SheetSetup): string {
	const parts: string[] = [];
	if (
		orientation.top !== DEFAULT_ORIENTATION.top ||
		orientation.front !== DEFAULT_ORIENTATION.front
	) {
		parts.push(
			`top ${colorName(orientation.top)}, front ${colorName(orientation.front)}`,
		);
	}
	if (startMoves.length > 0) {
		parts.push(`after ${notations(startMoves)}`);
	}
	return parts.length === 0 ? "" : ` · Start: ${parts.join(", ")}`;
}

const plural = (count: number, word: string): string =>
	`${count} ${word}${count === 1 ? "" : "s"}`;

const TEMPLATE = `
<h1>Cubing steps generator</h1>
<div class="layout">
	<form class="controls" novalidate>
		<label for="sequence">Move sequence</label>
		<textarea id="sequence" rows="4" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
			aria-describedby="sequence-hint sequence-error"></textarea>
		<p id="sequence-hint" class="hint">Moves U D L R F B, each optionally followed by ' (counter-clockwise) or a repeat of 2 or 3 (L3 = L three times), separated by spaces.</p>
		<p id="sequence-error" class="error" role="alert" hidden></p>
		<fieldset class="options">
			<legend>Options</legend>
			<label class="check"><input type="checkbox" id="final-state"> Show final state</label>
			<p class="hint">Adds one last cube after the final step.</p>
			<details id="start-details">
				<summary>Starting position</summary>
				<div class="start-fields">
					<label for="orientation-top">Top color</label>
					<select id="orientation-top"></select>
					<label for="orientation-front">Front color</label>
					<select id="orientation-front"></select>
					<button id="orientation-reset" type="button" class="secondary">Reset to default orientation</button>
					<p id="options-status" class="status" role="status"></p>
					<label for="start-sequence">Starting sequence (scramble)</label>
					<textarea id="start-sequence" rows="2" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
						aria-describedby="start-hint start-error"></textarea>
					<p id="start-hint" class="hint">Applied to the solved cube before step 1. Its moves are not drawn.</p>
					<p id="start-error" class="error" role="alert" hidden></p>
				</div>
			</details>
		</fieldset>
		<div class="actions">
			<button id="example" type="button" class="secondary">Try example</button>
			<button id="download" type="button" class="primary" aria-describedby="download-reason download-status">Download PDF</button>
		</div>
		<p id="download-reason" class="hint"></p>
		<p id="download-status" class="status" role="status"></p>
	</form>
	<section class="sheet-area" aria-label="Sheet preview">
		<p id="summary" class="summary" role="status"></p>
		<div id="preview" class="preview"></div>
	</section>
</div>`;

export function mountApp(root: HTMLElement, deps: AppDeps): void {
	root.innerHTML = TEMPLATE;
	const $ = <T extends HTMLElement>(selector: string) =>
		root.querySelector(selector) as T;
	const input = $<HTMLTextAreaElement>("#sequence");
	const errorBox = $("#sequence-error");
	const startInput = $<HTMLTextAreaElement>("#start-sequence");
	const startError = $("#start-error");
	const startDetails = $<HTMLDetailsElement>("#start-details");
	const topSelect = $<HTMLSelectElement>("#orientation-top");
	const frontSelect = $<HTMLSelectElement>("#orientation-front");
	const optionsStatus = $("#options-status");
	const finalCheckbox = $<HTMLInputElement>("#final-state");
	const exampleButton = $<HTMLButtonElement>("#example");
	const downloadButton = $<HTMLButtonElement>("#download");
	const reason = $("#download-reason");
	const status = $("#download-status");
	const summary = $("#summary");
	const preview = $("#preview");

	input.placeholder = EXAMPLE_SEQUENCE;

	const addOptions = (select: HTMLSelectElement, colors: readonly Color[]) => {
		select.replaceChildren(
			...colors.map((color) => new Option(colorName(color), color)),
		);
	};
	addOptions(topSelect, COLORS);
	topSelect.value = DEFAULT_ORIENTATION.top;
	addOptions(frontSelect, validFrontColors(DEFAULT_ORIENTATION.top));
	frontSelect.value = DEFAULT_ORIENTATION.front;

	let shown: string | null = null;
	let shownPageCount = 1;
	let current: SheetSetup = {
		moves: [],
		startMoves: [],
		orientation: DEFAULT_ORIENTATION,
		finalState: false,
	};
	let busy = false;
	/** Why the download is unavailable, empty when it is allowed. */
	let blockReason = "";
	let timer: ReturnType<typeof setTimeout> | undefined;

	function startCube({ startMoves, orientation }: SheetSetup): CubeState {
		return applySequence(solvedCube(orientation), startMoves);
	}

	function renderCurrent(): string[] {
		return renderSheet(current.moves, {
			start: startCube(current),
			finalState: current.finalState,
		});
	}

	function showSheet(): void {
		const key = JSON.stringify([
			notations(current.moves),
			notations(current.startMoves),
			current.orientation,
			current.finalState,
		]);
		if (shown === key) {
			return;
		}
		shown = key;
		const pages = renderCurrent();
		const layout = layoutSheet(current.moves, current.finalState);
		shownPageCount = pages.length;
		preview.replaceChildren();
		pages.forEach((svg, index) => {
			const page = document.createElement("div");
			page.className = "page";
			page.setAttribute("role", "img");
			page.setAttribute(
				"aria-label",
				`Page ${index + 1} of ${pages.length}: ${(layout[index]?.steps ?? [])
					.map((step) => step.move?.notation ?? "final state")
					.join(" ")}`,
			);
			page.innerHTML = svg;
			preview.append(page);
		});
	}

	function updateDownload(): void {
		downloadButton.disabled = blockReason !== "" || busy;
		reason.textContent = blockReason;
		reason.hidden = blockReason === "";
	}

	function showError(
		box: HTMLElement,
		field: HTMLTextAreaElement,
		message: string,
	): void {
		box.hidden = message === "";
		box.textContent = message;
		field.setAttribute("aria-invalid", String(message !== ""));
	}

	function refresh(): void {
		const main = parseSequence(input.value);
		const start = parseSequence(startInput.value);
		status.textContent = "";
		showError(errorBox, input, main.ok ? "" : describeError(main.error));
		showError(
			startError,
			startInput,
			start.ok ? "" : `Starting sequence: ${describeError(start.error)}`,
		);
		if (main.ok && start.ok) {
			current = {
				moves: main.moves,
				startMoves: start.moves,
				orientation: {
					top: topSelect.value as Color,
					front: frontSelect.value as Color,
				},
				finalState: finalCheckbox.checked,
			};
			showSheet();
			delete preview.dataset.stale;
			summary.textContent =
				current.moves.length === 0
					? "Enter a move sequence to start."
					: `${plural(current.moves.length, "step")} · ${plural(shownPageCount, "page")}${describeStart(current)}`;
			blockReason =
				current.moves.length === 0 ? "Enter a sequence to download." : "";
			updateDownload();
			return;
		}
		showSheet();
		preview.dataset.stale = "true";
		if (!start.ok) {
			startDetails.open = true;
		}
		summary.textContent =
			current.moves.length === 0
				? "Fix the sequence to see the preview."
				: `Preview is out of date. ${plural(current.moves.length, "step")} shown.`;
		blockReason = !main.ok
			? `Fix move ${main.error.position} to download.`
			: `Fix move ${start.ok ? 0 : start.error.position} of the starting sequence to download.`;
		updateDownload();
	}

	function scheduleRefresh(): void {
		clearTimeout(timer);
		if (deps.debounceMs > 0) {
			timer = setTimeout(refresh, deps.debounceMs);
		} else {
			refresh();
		}
	}

	function changeTop(): void {
		const previous = frontSelect.value as Color;
		const fronts = validFrontColors(topSelect.value as Color);
		addOptions(frontSelect, fronts);
		optionsStatus.textContent = "";
		if (fronts.includes(previous)) {
			frontSelect.value = previous;
			return;
		}
		const next = fronts.includes(DEFAULT_ORIENTATION.front)
			? DEFAULT_ORIENTATION.front
			: (fronts[0] as Color);
		frontSelect.value = next;
		optionsStatus.textContent = `Front color changed to ${colorName(next)}.`;
	}

	input.addEventListener("input", scheduleRefresh);
	startInput.addEventListener("input", scheduleRefresh);
	finalCheckbox.addEventListener("change", refresh);
	frontSelect.addEventListener("change", () => {
		optionsStatus.textContent = "";
		refresh();
	});
	topSelect.addEventListener("change", () => {
		changeTop();
		refresh();
	});
	$("#orientation-reset").addEventListener("click", () => {
		topSelect.value = DEFAULT_ORIENTATION.top;
		addOptions(frontSelect, validFrontColors(DEFAULT_ORIENTATION.top));
		frontSelect.value = DEFAULT_ORIENTATION.front;
		optionsStatus.textContent = "";
		refresh();
	});

	exampleButton.addEventListener("click", () => {
		input.value = EXAMPLE_SEQUENCE;
		refresh();
	});

	downloadButton.addEventListener("click", async () => {
		if (busy || blockReason !== "") {
			return;
		}
		busy = true;
		downloadButton.disabled = true;
		downloadButton.setAttribute("aria-busy", "true");
		downloadButton.textContent = "Generating…";
		status.textContent = "";
		try {
			const bytes = await deps.buildPdf(renderCurrent());
			const filename = `cubing-steps-${current.moves.length}-moves.pdf`;
			deps.savePdf(bytes, filename);
			status.textContent = `PDF saved as ${filename}.`;
		} catch {
			status.textContent = "The PDF could not be generated. Try again.";
		} finally {
			busy = false;
			downloadButton.setAttribute("aria-busy", "false");
			downloadButton.textContent = "Download PDF";
			updateDownload();
		}
	});

	downloadButton.setAttribute("aria-busy", "false");
	refresh();
}
