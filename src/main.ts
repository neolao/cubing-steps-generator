import "./styles.css";
import { mountApp } from "./app";
import { translationFor } from "./i18n";
import { buildPdf } from "./pdf";

function savePdf(bytes: Uint8Array, filename: string): void {
	const url = URL.createObjectURL(
		new Blob([bytes as BlobPart], { type: "application/pdf" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const root = document.querySelector<HTMLElement>("#app");
if (root) {
	mountApp(root, {
		buildPdf,
		savePdf,
		debounceMs: 150,
		t: translationFor(document.documentElement.lang),
		search: location.search,
	});
}
