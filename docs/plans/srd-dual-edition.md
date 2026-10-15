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

The current scope is the SRD information pages, edition-aware SRD assistant retrieval, and character-sheet autofill. Preserve the source IDs as edition-specific records. The toggle connects 64 explicit one-to-one ID pairs whose names and class/subclass context match uniquely in the pinned source data, such as `rage` and `barbarian-rage`; ambiguous and repeated features remain unavailable. Keep the existing 2014 derived datasets as they are for now. Character-sheet feature, spell, and equipment suggestions offer separate edition-labelled choices and copy the selected edition's text into the existing sheet fields. Class features put the class last, for example, “Unarmored Defense (2024) — Barbarian.” Monster Codex is out of scope. The paused dice tray project is unrelated and kept on its own branch.

The SRD assistant now receives the selected page edition and can use explicit 2014/2024 wording for standalone questions. Comparisons show the named source records separately with links, without a model-generated comparison. The assistant and VTT promotion cards can be dismissed and restored. Repetitive FAQ sections and FAQPage metadata were removed from SRD templates while preserving the rules text. Keep the shared page design and the `?edition=2024` toggle.

Monster detail pages now share the original stat-block layout across editions. The 2024 data keeps its own rules text and adds its available gear, bonus actions, reactions, lair XP, and forms without reusing 2014 derived relationships.

## Verification and status

The SRD pages, assistant comparison behavior, page cleanup, and character-sheet autofill are on `feat/srd-2024-edition-toggle` for PR review. They have not been merged or deployed.
