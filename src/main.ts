import { parseSequence } from "./moves";

const app = document.querySelector<HTMLElement>("#app");
if (app) {
	app.textContent = `Moves parser ready (${parseSequence("F L F").length} moves in demo)`;
}
