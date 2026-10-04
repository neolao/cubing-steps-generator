# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- The page is now optimized for search engines: a descriptive title and summary, a preview image and card when the link is shared, a site icon, a short text section explaining the notation and the PDF, and the files that help search engines discover the site.

## [1.1.1] - 2026-10-04

### Fixed

- The white outline around the x2 / x3 count is now visible in the downloaded PDF, as it is on the page.

## [1.1.0] - 2026-10-03

### Added

- Users can type a Rubik's Cube move sequence and get a printable A4 sheet of numbered steps, each showing the cube before the move with an arrow on the turned layer and an xN marker for repeated turns, then download it as a PDF generated in the browser. Sequences longer than 30 steps continue on a new page, and invalid moves are explained next to the field.

- Users can write a repeated move such as `L3` (the face turned clockwise three times), and the x2 / x3 marker now sits clearly apart from the arrow.

- Users can choose how the cube is held at the start (top and front colors, only valid combinations offered), and the whole sheet follows that orientation.

- Users can enter an optional starting sequence (a scramble) so the first cube shows that state; its moves are not drawn as steps and mistakes in it are explained next to its own field.

- Users can tick "Show final state" to add a last, labelled cube after the final step, without arrow or number.

- Sheets with many steps now use 4 or 5 columns when that gives larger cubes, so the A4 page is filled as well as possible.

### Changed

- Repeated moves are now limited to `X2` and `X3`: `X4` is a full turn and changes nothing, so larger counts are refused with an explanation next to the field.

[Unreleased]: https://github.com/neolao/cubing-steps-generator/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/neolao/cubing-steps-generator/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/neolao/cubing-steps-generator/releases/tag/v1.1.0
