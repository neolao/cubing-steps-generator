# cubing-steps-generator

A static web page that turns a text move sequence into a printable PDF of Rubik's Cube solving steps. Everything runs in the browser and the site is hosted on GitHub Pages.

<!-- vibe:begin:features -->
- Type a move sequence such as `F L F U' R U` and see the numbered steps as you type.
- Each step shows the cube before the move, with an arrow on the turned layer and a red x2, x3… for repeated turns.
- Download the sheet as a vector PDF on A4 paper. Nothing leaves your browser.
- Longer sequences use 4 or 5 columns to keep the cubes large; sequences over 30 steps continue on new pages.
- Mistakes are explained next to the field, with the move number to fix.
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

Moves use standard notation, separated by spaces or line breaks: a face letter (`U D L R F B`, capitals only), optionally followed by `'` (counter-clockwise) or a repeat count from `2` to `9` (`L3` turns the left face clockwise three times, shown with a red x3), for example `F L F U' L2`.

The cube starts with yellow on top, green in front and orange on the right.

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
