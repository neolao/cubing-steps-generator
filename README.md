# cubing-steps-generator

A static web page that turns a text move sequence into a printable PDF of Rubik's Cube solving steps. Everything runs in the browser and the site is hosted on GitHub Pages.

<!-- vibe:begin:features -->
No released features yet. Planned: enter a move sequence such as `F L F U' R U`, then download a PDF with one numbered step per move.
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

```sh
npm run dev      # start the page locally
npm run build    # build the static site into dist/
npm run preview  # serve the built site locally
npm test         # run the tests
npm run lint     # check and fix code style
```

Moves use standard notation, separated by spaces: a face letter (`U D L R F B`), optionally followed by `2` (half turn) or `'` (counter-clockwise), for example `F L F U' L2`.

Pushing to `main` deploys the site to GitHub Pages (enable Pages with the "GitHub Actions" source in the repository settings).
<!-- vibe:end:usage -->

<!-- vibe:begin:docs-index -->
No additional documentation yet.
<!-- vibe:end:docs-index -->
