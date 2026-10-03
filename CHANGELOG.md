# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Users can type a Rubik's Cube move sequence and get a printable A4 sheet of numbered steps, each showing the cube before the move with an arrow on the turned layer and an xN marker for repeated turns, then download it as a PDF generated in the browser. Sequences longer than 30 steps continue on a new page, and invalid moves are explained next to the field.

- Users can write a repeated move such as `L3` (the face turned clockwise three times), and the x2 / x3 marker now sits clearly apart from the arrow.

- Sheets with many steps now use 4 or 5 columns when that gives larger cubes, so the A4 page is filled as well as possible.

### Changed

- Repeated moves are now limited to `X2` and `X3`: `X4` is a full turn and changes nothing, so larger counts are refused with an explanation next to the field.
