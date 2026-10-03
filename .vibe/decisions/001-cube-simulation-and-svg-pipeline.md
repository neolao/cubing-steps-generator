---
date: 2026-10-03
status: accepted
---
# Simulate the cube and render one SVG layout for preview and PDF
**Context:** Each sheet step shows the cube state before the move, so the text sequence cannot be rendered without simulating the cube.
**Decision:** A facelet-based cube model applies the 18 moves. One layout function produces SVG pages used by both the on-screen preview and the PDF export. Sequences longer than 30 steps continue on a new A4 page.
**Reason:** One source of truth keeps the preview and the PDF identical, and the facelet model makes expected states testable with independently derived values.
**Rejected alternatives:** Drawing assets per move (18 hand-made images, no real state); rasterizing the preview into the PDF (blurry, heavy); a single page with unbounded shrinking (unreadable beyond ~45 steps).
