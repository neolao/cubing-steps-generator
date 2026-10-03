import { MAX_STEPS_PER_PAGE } from "./layout";
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

const plural = (count: number, word: string): string =>
	`${count} ${word}${count === 1 ? "" : "s"}`;

const TEMPLATE = `
<h1>Cubing steps generator</h1>
<div class="layout">
	<form class="controls" novalidate>
		<label for="sequence">Move sequence</label>
		<textarea id="sequence" rows="4" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"
			aria-describedby="sequence-hint sequence-error"></textarea>
		<p id="sequence-hint" class="hint">Moves U D L R F B, each optionally followed by ' (counter-clockwise) or a repeat from 2 to 9 (L3 = L three times), separated by spaces.</p>
		<p id="sequence-error" class="error" role="alert" hidden></p>
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
	const exampleButton = $<HTMLButtonElement>("#example");
	const downloadButton = $<HTMLButtonElement>("#download");
	const reason = $("#download-reason");
	const status = $("#download-status");
	const summary = $("#summary");
	const preview = $("#preview");

	input.placeholder = EXAMPLE_SEQUENCE;

	let shown: Move[] | null = null;
	let current: Move[] = [];
	let busy = false;
	/** Why the download is unavailable, empty when it is allowed. */
	let blockReason = "";
	let timer: ReturnType<typeof setTimeout> | undefined;

	function showSheet(moves: Move[]): void {
		if (shown === moves) {
			return;
		}
		shown = moves;
		const pages = renderSheet(moves);
		preview.replaceChildren();
		pages.forEach((svg, index) => {
			const page = document.createElement("div");
			page.className = "page";
			page.setAttribute("role", "img");
			page.setAttribute(
				"aria-label",
				`Page ${index + 1} of ${pages.length}: ${moves
					.slice(index * MAX_STEPS_PER_PAGE, (index + 1) * MAX_STEPS_PER_PAGE)
					.map((move) => move.notation)
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

	function refresh(): void {
		const result = parseSequence(input.value);
		status.textContent = "";
		if (result.ok) {
			current = result.moves;
			showSheet(current);
			delete preview.dataset.stale;
			errorBox.hidden = true;
			errorBox.textContent = "";
			input.setAttribute("aria-invalid", "false");
			const pageCount = Math.max(
				1,
				Math.ceil(current.length / MAX_STEPS_PER_PAGE),
			);
			summary.textContent =
				current.length === 0
					? "Enter a move sequence to start."
					: `${plural(current.length, "step")} · ${plural(pageCount, "page")}`;
			blockReason = current.length === 0 ? "Enter a sequence to download." : "";
			updateDownload();
			return;
		}
		showSheet(current);
		preview.dataset.stale = "true";
		errorBox.hidden = false;
		errorBox.textContent = describeError(result.error);
		input.setAttribute("aria-invalid", "true");
		summary.textContent =
			current.length === 0
				? "Fix the sequence to see the preview."
				: `Preview is out of date. ${plural(current.length, "step")} shown.`;
		blockReason = `Fix move ${result.error.position} to download.`;
		updateDownload();
	}

	input.addEventListener("input", () => {
		clearTimeout(timer);
		if (deps.debounceMs > 0) {
			timer = setTimeout(refresh, deps.debounceMs);
		} else {
			refresh();
		}
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
			const bytes = await deps.buildPdf(renderSheet(current));
			const filename = `cubing-steps-${current.length}-moves.pdf`;
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
