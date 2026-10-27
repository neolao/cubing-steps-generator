---
date: 2026-10-27
status: accepted
---
# Per-language pages generated from the translations
**Context:** The site is offered in seven languages, one URL each (`/`, `/fr/`, `/es/`, `/it/`, `/zh/`, `/ja/`, `/ko/`), each with its own title, description, FAQ, hreflang links and a language selector.
**Decision:** Page text lives in one typed dictionary per language. A pure function renders each page and the sitemap from the dictionaries, and the generated files are committed and checked by file-snapshot tests (`vitest -u` regenerates them). Vite builds the seven pages as separate inputs.
**Reason:** The hreflang list, the selector and the sitemap are written once and cannot drift; a missing translation key fails the type check; no build plugin is needed.
**Rejected alternatives:** Seven hand-written HTML copies (49 hreflang lines and seven selectors to align by hand, enforced only by structural tests); a Vite plugin templating one page (unverified virtual-entry support, harder to test).
