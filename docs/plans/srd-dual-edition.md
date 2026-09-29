# Dual-edition SRD pages

The existing SRD URLs and page style serve both editions. Pages default to 2014; `?edition=2024` selects the imported 2024 data. The edition toggle appears on the existing SRD pages. An unavailable edition is greyed out with the hover title `Unavailable`. A direct 2024 URL without matching data redirects to its 2014 URL with the edition parameter removed (other query parameters remain).

## Data available

- Source: 5e-bits/5e-database, English files in `src/2024/en/` at commit `6f6299e75b4fa56ed882bfb1429f6dc6b4c65330`.
- Stored separately under `public/lib/data/2024/`: 25 JSON categories, 2,013 records, about 3.1 MB on disk.
- Major categories: 339 spells, 341 monsters, 12 classes, 12 subclasses, 9 species, 24 subspecies, 4 backgrounds, 17 feats, 182 equipment entries, 262 magic items.
- Includes class levels, features, traits, skills, proficiencies, conditions, damage types, ability scores, equipment categories, weapon properties and mastery properties, languages, alignments, magic schools, and poisons.
- The source does **not** include 2024 `rules` or `rule-sections` files. The official [SRD 5.2.1](https://www.dndbeyond.com/srd) remains the complete rules reference.
- `source-manifest.json` records the pinned commit, counts, SHA-256 hashes, missing categories, and source reference audit. It reports no unresolved object references; it does not certify completeness against the official SRD.

`src/tools/download-5e-srd.ts` now reads upstream's edition/language folders and validates all requested files before writing them. It skips the existing 2014 derived-data builders for 2024 because the schemas differ. Existing 2014 files were not reimported.

## Page coverage and implementation boundary

Existing SRD categories, details, and spell/monster filters use 2024 records where available. The existing races URL displays 2024 species. Class progression uses the 2024 levels data; equipment also shows magic items and poisons; weapon properties also shows mastery properties. The data files are read server-side for requested pages; the whole dataset is not added to the browser bundle.

`src/dnd/srd/editionView.ts` resolves 2024 requests and supplies the toggle state. The original 2014 route handlers and template bodies remain in use for the default edition; the same EJS files render the shared 2024 view when selected. 2024 pages use `noindex,follow` and are not added to the sitemap. No separate 2024 route tree or browser-side library was added.

This work changes the SRD information pages. Search, derived relationships outside these pages, character sheets, `/5e`, Monster Codex, and other integrations still need separate edition decisions and implementation. The paused dice tray project is unrelated.

## Verification and status

Route tests cover toggling, unavailable entries, redirects, and representative 2024 content. A local HTTP crawl rendered all 1,394 available 2024 detail URLs without failures. Typecheck, tests, server build, and stylesheet lint passed. The changes are local and uncommitted; nothing has been published.
