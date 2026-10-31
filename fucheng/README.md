# 府城四段散步 · 2026-10-31

This buildless 2D experience is shared by `/fucheng/` and the original Tainan explorer's first tab. The original 37-district, attraction, season, policy, passport and 44-place culture views remain available. Culture choices add reading postcards only; they do not award the older quiz-based stamps or indicate physical visits.

## Content

- Four official sources and their update dates are attached to each chapter in `data.js`; checked 2026-10-31.
- Character dialogue, the neighborhood exhibition and scene images are fictional framing. Facts are separately identified, paraphrased and linked. Anping's source contains inconsistent fort-completion years, so no completion year is asserted here.
- Scene illustrations are not location photos, navigation maps or architectural reconstructions. The Confucius Temple illustration is not used as visual evidence of the roof birds.
- No operational hours, prices, funding eligibility, legal or tax rules were added.

## Generated artwork provenance

Original generated master: `exec-3eba16ff-9b83-4769-a06f-f56838266c8e.png` (1536 × 1024). Image generation was used for four illustrations on a 2 × 2 sheet. Sharp only crops the four 768 × 512 panels and encodes WebP, quality 83. The runtime uses independent complete images, not sprite-atlas cropping.

Art brief: a warm, refined handcrafted storybook series, muted jade, terracotta and golden cream; upper left a present-day Shennong-inspired lane with shop houses and lamps, no river; upper right Great South Gate and its curved outer court in a park; lower left Confucius Temple courtyard, red walls and trees; lower right an Anping old brick wall with banyan roots and a separate, later white watchtower. No foreground people, labels, UI, map, logos or claim of historical reconstruction.

## Behavior and checks

`node fucheng/test-fucheng.mjs` covers 16 complete choice combinations, reload, revisits, incomplete reading, deep links to the original culture data, source URLs and 280 whole-pixel sprite layouts. The original lantern story, presentation and mission bridge suites remain required.

New progress is isolated under `anxin-fucheng-journey-v1`; blocked storage leaves the current session playable. Feedback stays in memory, has a preview, and opens the existing official LINE with URL-encoded text only after a click. Sending remains the visitor's action in LINE. No backend, tracking, contact submission or calculator changes.

## Rendering adjustment

The lantern map keeps the original road graph, walking speed and gameplay coordinates. Full decoded character images now use integer CSS-pixel boxes. Map camera movement also uses integer positioning; the forced transform layer and animated image rotation were removed. A small whole-pixel walking bob remains. Labels track the rendered sprite height on narrow screens.

## Release / rollback

The release is reviewed in PR #1. Pre-release `main`: `f5a837367a14af5ddd115febbc20f11e7509be63`. Restore with a normal revert of the merge commit if needed; do not force-push or delete progress keys. Local `.openai/`, preview harnesses and build helpers are QA-only and are not part of the published changes.
