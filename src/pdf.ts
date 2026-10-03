import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

function parseSvg(svg: string): SVGSVGElement {
	const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
	return document.importNode(
		parsed.documentElement,
		true,
	) as unknown as SVGSVGElement;
}

/** Draws each SVG page as vector graphics on its own A4 page. */
export async function buildPdf(
	svgPages: readonly string[],
): Promise<Uint8Array> {
	const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
	const host = document.createElement("div");
	host.style.cssText = "position:absolute;left:-99999px;top:0";
	document.body.append(host);
	try {
		for (const [index, svg] of svgPages.entries()) {
			if (index > 0) {
				doc.addPage("a4", "portrait");
			}
			const element = parseSvg(svg);
			host.replaceChildren(element);
			await svg2pdf(element, doc, {
				x: 0,
				y: 0,
				width: A4_WIDTH_PT,
				height: A4_HEIGHT_PT,
			});
		}
	} finally {
		host.remove();
	}
	return new Uint8Array(doc.output("arraybuffer"));
}
