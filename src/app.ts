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
import type { Translation } from "./i18n/types";
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
	t: Translation;
	/** The page's `location.search`, carrying the state from another language page. */
	search: string;
}

/** What the sheet is drawn from: the moves and everything that shapes the first and last cubes. */
interface SheetSetup {
	moves: Move[];
	startMoves: Move[];
	orientation: Orientation;
	finalState: boolean;
}

const notations = (moves: readonly Move[]): string =>
	moves.map((move) => move.notation).join(" ");

const escapeHtml = (text: string): string =>
	text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");

const isDefaultOrientation = ({ top, front }: Orientation): boolean =>
	top === DEFAULT_ORIENTATION.top && front === DEFAULT_ORIENTATION.front;

/** The state carried across language pages in the query string. */
interface CarriedState {
	moves: string;
	start: string;
	orientation: Orientation;
	finalState: boolean;
}

function readQuery(search: string): CarriedState {
	const params = new URLSearchParams(search);
	const top = params.get("top") as Color | null;
	const front = params.get("front") as Color | null;
	const validPair =
		top !== null &&
		front !== null &&
		COLORS.includes(top) &&
		validFrontColors(top).includes(front);
	return {
		moves: params.get("moves") ?? "",
		start: params.get("start") ?? "",
		orientation: validPair ? { top, front } : DEFAULT_ORIENTATION,
		finalState: params.get("final") === "1",
	};
}

function toQuery({ moves, start, orientation, finalState }: CarriedState) {
	const params = new URLSearchParams();
	if (moves !== "") {
		params.set("moves", moves);
	}
	if (start !== "") {
		params.set("start", start);
	}
	if (!isDefaultOrientation(orientation)) {
		params.set("top", orientation.top);
		params.set("front", orientation.front);
	}
	if (finalState) {
		params.set("final", "1");
	}
	const query = params.toString().replaceAll("+", "%20");
	return query === "" ? "" : `?${query}`;
}

function template(t: Translation): string {
	const ui = Object.fromEntries(
		Object.entries(t.ui).map(([key, value]) => [
			key,
			typeof value === "string" ? escapeHtml(value) : value,
		]),
	) as unknown as Translation["ui"];
	return `
<div class="layout">
	<form class="controls" novalidate>
		<label for="sequence">${ui.moveSequenceLabel}</label>
		<textarea id="sequence" rows="4" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
			aria-describedby="sequence-hint sequence-error"></textarea>
		<p id="sequence-hint" class="hint">${ui.sequenceHint}</p>
		<p id="sequence-error" class="error" role="alert" hidden></p>
		<fieldset class="options">
			<legend>${ui.optionsLegend}</legend>
			<label class="check"><input type="checkbox" id="final-state"> ${ui.showFinalState}</label>
			<p class="hint">${ui.finalStateHint}</p>
			<details id="start-details">
				<summary>${ui.startingPosition}</summary>
				<div class="start-fields">
					<label for="orientation-top">${ui.topColor}</label>
					<select id="orientation-top"></select>
					<label for="orientation-front">${ui.frontColor}</label>
					<select id="orientation-front"></select>
					<button id="orientation-reset" type="button" class="secondary">${ui.resetOrientation}</button>
					<p id="options-status" class="status" role="status"></p>
					<label for="start-sequence">${ui.startingSequenceLabel}</label>
					<textarea id="start-sequence" rows="2" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
						aria-describedby="start-hint start-error"></textarea>
					<p id="start-hint" class="hint">${ui.startingSequenceHint}</p>
					<p id="start-error" class="error" role="alert" hidden></p>
				</div>
			</details>
		</fieldset>
		<div class="actions">
			<button id="example" type="button" class="secondary">${ui.tryExample}</button>
			<button id="download" type="button" class="primary" aria-describedby="download-reason download-status">${ui.downloadPdf}</button>
		</div>
		<p id="download-reason" class="hint"></p>
		<p id="download-status" class="status" role="status"></p>
	</form>
	<section class="sheet-area" aria-label="${ui.sheetPreview}">
		<p id="summary" class="summary" role="status"></p>
		<div id="preview" class="preview"></div>
	</section>
</div>`;
}

export function mountApp(root: HTMLElement, deps: AppDeps): void {
	const { t } = deps;
	const colorName = (color: Color): string => t.ui.colors[color];

	/** The non-default starting position, for the summary ("" when it is the default). */
	function describeStart({ startMoves, orientation }: SheetSetup): string {
		const parts: string[] = [];
		if (!isDefaultOrientation(orientation)) {
			parts.push(
				t.ui.startOrientation(
					colorName(orientation.top),
					colorName(orientation.front),
				),
			);
		}
		if (startMoves.length > 0) {
			parts.push(t.ui.startAfter(notations(startMoves)));
		}
		return parts.length === 0 ? "" : t.ui.startSummary(parts);
	}

	root.innerHTML = template(t);
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
	const carried = readQuery(deps.search);
	addOptions(topSelect, COLORS);
	topSelect.value = carried.orientation.top;
	addOptions(frontSelect, validFrontColors(carried.orientation.top));
	frontSelect.value = carried.orientation.front;
	input.value = carried.moves;
	startInput.value = carried.start;
	finalCheckbox.checked = carried.finalState;
	startDetails.open =
		carried.start !== "" || !isDefaultOrientation(carried.orientation);

	const languageLinks = Array.from(
		root.ownerDocument.querySelectorAll<HTMLAnchorElement>(
			"nav.language-selector a[href]",
		),
	);
	for (const link of languageLinks) {
		link.dataset.baseHref = link.getAttribute("href") ?? "";
	}

	function carryStateInLinks(): void {
		const query = toQuery({
			moves: input.value,
			start: startInput.value,
			orientation: {
				top: topSelect.value as Color,
				front: frontSelect.value as Color,
			},
			finalState: finalCheckbox.checked,
		});
		for (const link of languageLinks) {
			link.setAttribute("href", `${link.dataset.baseHref}${query}`);
		}
	}

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
				t.ui.pageLabel(
					index + 1,
					pages.length,
					(layout[index]?.steps ?? [])
						.map((step) => step.move?.notation ?? t.ui.finalStateWord)
						.join(" "),
				),
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
		carryStateInLinks();
		showError(errorBox, input, main.ok ? "" : describeError(main.error, t));
		showError(
			startError,
			startInput,
			start.ok ? "" : t.ui.startingSequenceError(describeError(start.error, t)),
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
					? t.ui.enterMoves
					: t.ui.summary(
							t.ui.steps(current.moves.length),
							t.ui.pages(shownPageCount),
							describeStart(current),
						);
			blockReason =
				current.moves.length === 0 ? t.ui.enterSequenceToDownload : "";
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
				? t.ui.fixSequence
				: t.ui.previewOutdated(current.moves.length);
		blockReason = !main.ok
			? t.ui.fixMove(main.error.position)
			: t.ui.fixStartMove(start.ok ? 0 : start.error.position);
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
		optionsStatus.textContent = t.ui.frontColorChanged(colorName(next));
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
		downloadButton.textContent = t.ui.generating;
		status.textContent = "";
		try {
			const bytes = await deps.buildPdf(renderCurrent());
			const filename = `cubing-steps-${current.moves.length}-moves.pdf`;
			deps.savePdf(bytes, filename);
			status.textContent = t.ui.pdfSaved(filename);
		} catch {
			status.textContent = t.ui.pdfFailed;
		} finally {
			busy = false;
			downloadButton.setAttribute("aria-busy", "false");
			downloadButton.textContent = t.ui.downloadPdf;
			updateDownload();
		}
	});

	downloadButton.setAttribute("aria-busy", "false");
	refresh();
}
