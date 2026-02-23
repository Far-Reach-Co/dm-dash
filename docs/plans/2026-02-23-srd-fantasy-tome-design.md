# SRD Fantasy Tome Polish — Design Doc
**Date:** 2026-02-23
**Branch:** feat/srd-styling-cleanup
**Scope:** Visual polish pass across all D&D 5E SRD pages

---

## Goal

Elevate the SRD pages from "clean and functional" to "elegant fantasy reference." Retain the dark D&D theme already established. No animations. No external assets.

---

## 1. Atmospheric Background Texture

Add a very faint SVG noise grain to `.info-container` to break the flat darkness and give the pages a slightly aged, parchment-adjacent quality.

- CSS `background-image` using an inline SVG `<feTurbulence>` filter — no file needed
- Opacity ~3–5% so it's barely perceptible
- Applied to `.info-container` only (not the full page body)

---

## 2. Ornamental Section Dividers

Replace `.info-container hr` with a styled divider that has a centered decorative glyph (✦) flanked by faint gradient lines — matching the dark fantasy tone.

- Implemented entirely in CSS via `::before` / `::after` pseudo-elements
- The existing `hr` elements in templates are kept; CSS overrides their appearance
- `hr.w-75` and `hr.w-50` (internal section breaks in detail pages) remain simpler/fainter — only top-level `hr` gets the ornamental treatment
- No template changes needed for this piece

---

## 3. Spell Stat Block Grid

The current casting time / range / components / duration block uses `.inline-div` which runs everything together inline. Replace with a proper 2×2 labeled-field grid.

**New structure in `spell.ejs`:**
```html
<div class="spell-stat-block">
  <div class="spell-stat-field">
    <span class="spell-stat-label">Casting Time</span>
    <span class="spell-stat-value">...</span>
  </div>
  ...
</div>
```

**CSS:** subtle card background (`var(--blue3)`), thin ornate border, 2-column grid on desktop / 1-column on mobile. Labels in small uppercase.

---

## 4. Monster Ability Score Grid

The STR/DEX/CON/INT/WIS/CHA block currently flows as two lines of inline text. Replace with a 6-column horizontal grid matching the classic D&D stat block format.

**New structure in `monster.ejs`:**
```html
<div class="monster-ability-grid">
  <div class="ability-cell">
    <span class="ability-label">STR</span>
    <span class="ability-score">18</span>
    <span class="ability-mod">(+4)</span>
  </div>
  ...
</div>
```

**CSS:** 6 equal columns, centered text, subtle separator lines between cells, warm accent color on the score number.

---

## 5. Detail Page H1 Treatment

Apply the same warm gradient text already used on `.intro h1` to the `h1` elements within `.info-container` — spell names, monster names, class names, etc.

- CSS only: `.info-container h1` gets the `background-clip: text` gradient
- Gradient: `var(--orange3)` → `var(--orange2)` (warmer, less jarring than the intro version)
- Font size adjusted to be clearly the largest element on the page

---

## 6. Index List Hover States

The column list items in spell/monster/feature index pages are plain links. Add a subtle hover treatment:

- On hover: faint warm background tint behind the `<li>`, link shifts to `--orange3`
- Implemented via `.info-container > ul > li` hover and the new `.srd-col-list-*` items

---

## 7. Filter Pill Active/Hover Refinement

Small touch: the `.quick-links a.active` state (interactive school/level filters on the spells page) could have a slightly warmer glow — a `box-shadow` using `--glow-warm` variable already defined in the design system.

---

## Files Changed

- `public/css/features/info.css` — all CSS changes
- `views/dnd/5e/srd/spell.ejs` — stat block markup
- `views/dnd/5e/srd/monster.ejs` — ability score grid markup

All other pages benefit from the CSS-only changes (texture, dividers, h1, list hovers) without template edits.

---

## Out of Scope

- Animations or transitions beyond what already exists
- External image assets
- Changes to non-SRD pages
- Mobile layout restructuring
