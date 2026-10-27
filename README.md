# Cubing Steps Generator

**Free online tool: turn a Rubik's Cube algorithm into a printable PDF of numbered, illustrated steps.** Type a move sequence in standard notation (`F L F U' R U F2 L2 U'`) and get an A4 sheet showing the 3x3 cube before each move, with an arrow on the layer to turn. Ideal for teaching a solution, sharing an algorithm or making a cube-solving tutorial.

**Try it: <https://neolao.github.io/cubing-steps-generator/>**

Everything runs in the browser (no upload, no account) and the site is hosted on GitHub Pages.

<!-- vibe:begin:features -->
- Type a move sequence such as `F L F U' R U` and see the numbered steps as you type.
- Each step shows the cube before the move, with an arrow on the turned layer and a red x2, x3… for repeated turns.
- Download the sheet as a vector PDF on A4 paper. Nothing leaves your browser.
- Longer sequences use 4 or 5 columns to keep the cubes large; sequences over 30 steps continue on new pages.
- Optionally choose the starting orientation, start from a scrambled cube, and add a final-state cube.
- Mistakes are explained next to the field, with the move number to fix.
- Available in English, French, Spanish, Italian, Chinese, Japanese and Korean, with a language selector at the top of every page; what you typed is kept when you switch language.
<!-- vibe:end:features -->

<!-- vibe:begin:install -->
## Installation

Prerequisite: Node.js 22 or later.

```sh
git clone <repository-url>
cd cubing-steps-generator
npm install
```

Check that everything works with `npm test`.
<!-- vibe:end:install -->

<!-- vibe:begin:usage -->
## Usage

1. Open the page and type your moves in the "Move sequence" field, or press "Try example".
2. Check the preview of the A4 sheet.
3. Press "Download PDF".

Moves use standard notation, separated by spaces or line breaks: a face letter (`U D L R F B`, capitals only) or a middle layer: `M` (between the left and right faces, turning like `L`), `E` (between the top and bottom faces, turning like `D`) or `S` (between the front and back faces, turning like `F`), optionally followed by `'` (counter-clockwise) or a repeat count of `2` or `3` (`L3` turns the left face clockwise three times, shown with a red x3), for example `F L F U' L2`.

By default the cube starts solved, with yellow on top, green in front and orange on the right. Under "Options" you can:

- tick "Show final state" to add one last cube after the final step;
- open "Starting position" to choose which colors are on top and in front, and to enter a starting sequence (a scramble applied before step 1, not drawn as steps).

The language pages are `/` (English), `/fr/`, `/es/`, `/it/`, `/zh/`, `/ja/` and `/ko/`. The move letters stay the same in every language.

Developer commands:

```sh
npm run dev      # start the page locally
npm run build    # build the static site into dist/
npm run preview  # serve the built site locally
npm test         # run the tests
npm run lint     # check and fix code style
```

Pushing to `main` deploys the site to GitHub Pages (enable Pages with the "GitHub Actions" source in the repository settings).
<!-- vibe:end:usage -->

<!-- vibe:begin:docs-index -->
- [Architecture](docs/architecture.md) — how a sequence becomes a preview and a PDF
- [Testing](docs/testing.md) — what the tests prove and how to run them
<!-- vibe:end:docs-index -->
