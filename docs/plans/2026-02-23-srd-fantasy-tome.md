# SRD Fantasy Tome Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate SRD pages with grain texture, ornamental dividers, gradient h1s, a spell stat grid, and a monster ability score grid — all CSS-first, no animations, no external assets.

**Architecture:** Pure CSS additions to `info.css` for atmosphere and typography; two template edits (`spell.ejs`, `monster.ejs`) to restructure stat block markup. Every other page benefits from CSS-only changes without touching templates.

**Tech Stack:** CSS custom properties (existing design system), EJS templates, no new dependencies.

---

### Task 1: Grain texture on `.info-container`

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Add the texture rule**

In `info.css`, find the `.info-container` rule (lines 1–5) and add a `background-image` using an inline SVG noise filter. This avoids any external file.

```css
.info-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
}
```

**Step 2: Verify visually**

Start the dev server. Open any SRD page (e.g. `/dnd/5e/srd/contents`). The background should look subtly textured — if it's too strong, reduce `opacity='0.035'` to `0.025`.

**Step 3: Commit**

```bash
git add public/css/features/info.css
git commit -m "style: add subtle grain texture to SRD info container"
```

---

### Task 2: Ornamental section dividers

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Replace the `.info-container hr` rule**

Find and replace the existing `/* ===== Horizontal Rule ===== */` block (the base `hr` rule, not the `w-75`/`w-50` overrides which should stay as-is):

```css
/* ===== Horizontal Rule ===== */
.info-container hr {
  border: none;
  height: 0;
  margin: 1.75rem 0;
  position: relative;
  overflow: visible;
  background: none;
}

.info-container hr::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(72, 99, 125, 0.4), transparent);
}

.info-container hr::after {
  content: '✦';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.6rem;
  color: rgba(116, 167, 215, 0.35);
  background: var(--main-dark);
  padding: 0 10px;
  letter-spacing: 0;
}
```

Keep the existing `hr.w-75` and `hr.w-50` overrides exactly as they are — those internal dividers stay as simple faint lines (no glyph).

**Step 2: Verify visually**

Check the spells page, spell detail page, and contents page. The main `<hr>` separators (breadcrumb area, between sections) should show a centered `✦` with gradient lines. The `hr.w-75` dividers on spell/monster detail pages should remain simple.

**Step 3: Commit**

```bash
git add public/css/features/info.css
git commit -m "style: ornamental hr dividers with centered glyph for SRD pages"
```

---

### Task 3: H1 gradient treatment on detail pages

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Add the h1 rule**

After the `/* ===== SRD Content Headings ===== */` block, add:

```css
/* ===== Detail Page H1 ===== */
.info-container > h1 {
  font-size: 2.2rem;
  margin: 1.25rem 0 0.5rem;
  background: linear-gradient(120deg, var(--orange3) 0%, var(--orange2) 60%, var(--blue6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}
```

**Step 2: Verify visually**

Open a spell detail page (e.g. `/dnd/5e/srd/spells/fireball`) and a monster page. The `h1` (spell name / monster name) should render with a warm gold-to-blue gradient. Confirm it doesn't bleed into breadcrumbs or neighboring elements.

**Step 3: Commit**

```bash
git add public/css/features/info.css
git commit -m "style: warm gradient h1 treatment on SRD detail pages"
```

---

### Task 4: Index list hover states

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Add hover treatment to column list items**

Find the `/* ===== SRD Navigation Lists ===== */` block. The existing rule targets `.info-container > ul > li`. Add hover styles:

```css
.info-container > ul > li {
  margin: 0;
  padding: 4px 8px 4px 0;           /* was: padding: 6px 0 */
  border-bottom: 1px solid rgba(72, 99, 125, 0.25);
  border-radius: 4px;
  transition: background 0.12s ease, padding-left 0.12s ease;
}

.info-container > ul > li:hover {
  background: rgba(47, 64, 84, 0.45);
  padding-left: 8px;
}
```

**Step 2: Ensure `.srd-col-list-3` and `.srd-col-list-2` list items get the same treatment**

Add:

```css
.srd-col-list-3 > li,
.srd-col-list-2 > li {
  padding: 3px 8px 3px 0;
  border-radius: 4px;
  transition: background 0.12s ease, padding-left 0.12s ease;
}

.srd-col-list-3 > li:hover,
.srd-col-list-2 > li:hover {
  background: rgba(47, 64, 84, 0.45);
  padding-left: 8px;
}
```

**Step 3: Verify visually**

Open the spells index page and hover over spell names in the column list. Items should subtly highlight and indent. Confirm the effect doesn't make the column layout jitter.

**Step 4: Commit**

```bash
git add public/css/features/info.css
git commit -m "style: subtle hover states on SRD index list items"
```

---

### Task 5: Filter pill + quick-links active polish

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Warm glow on active filter chip**

Find `.quick-links a.active` and add a `box-shadow`:

```css
.quick-links a.active {
  color: var(--orange2);
  background: var(--blue4);
  border-color: var(--orange2);
  box-shadow: 0 0 8px var(--glow-warm);   /* add this line */
}
```

**Step 2: Slightly warmer hover on `.srd-filter-pills a`**

Find `.srd-filter-pills a:hover` and add a subtle shadow:

```css
.srd-filter-pills a:hover {
  color: var(--orange3);
  border-color: rgba(209, 158, 116, 0.35);
  background: rgba(47, 64, 84, 0.65);
  box-shadow: 0 0 6px var(--glow-warm);    /* add this line */
}
```

**Step 3: Verify visually**

Open the spells page and click a school filter. The active chip should have a warm glow. Hover over browse-by pills to see the faint warm shadow.

**Step 4: Commit**

```bash
git add public/css/features/info.css
git commit -m "style: warm glow on active/hover filter chips"
```

---

### Task 6: Spell stat block grid — CSS

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Add spell stat block styles**

```css
/* ===== Spell Stat Block ===== */
.spell-stat-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 1rem 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-ornate);
  background: var(--border-ornate);   /* gap color = border color */
}

.spell-stat-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 11px 15px;
  background: linear-gradient(145deg, var(--blue3) 0%, rgba(31, 37, 49, 0.95) 100%);
}

.spell-stat-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--main-gray);
  font-weight: 600;
}

.spell-stat-value {
  font-size: 0.97rem;
  color: var(--bright-white);
  line-height: 1.4;
}

@media (max-width: 480px) {
  .spell-stat-block {
    grid-template-columns: 1fr;
  }
}
```

**Step 2: Commit CSS only first**

```bash
git add public/css/features/info.css
git commit -m "style: add spell-stat-block grid CSS"
```

---

### Task 7: Spell stat block grid — template

**Files:**
- Modify: `views/dnd/5e/srd/spell.ejs`

**Step 1: Replace the inline-div stat block**

Find the `<!-- Spell Stats -->` block (currently a `<div class="spell-stats">` containing four `<div class="inline-div">` elements) and replace with:

```ejs
<!-- Spell Stats -->
<div class="spell-stat-block">
  <div class="spell-stat-field">
    <span class="spell-stat-label">Casting Time</span>
    <span class="spell-stat-value"><%= spell.casting_time %></span>
  </div>
  <div class="spell-stat-field">
    <span class="spell-stat-label">Range</span>
    <span class="spell-stat-value"><%= spell.range %></span>
  </div>
  <div class="spell-stat-field">
    <span class="spell-stat-label">Components</span>
    <span class="spell-stat-value">
      <%= spell.components.join(', ') %>
      <% if (spell.material) { %><i> (<%= spell.material %>)</i><% } %>
    </span>
  </div>
  <div class="spell-stat-field">
    <span class="spell-stat-label">Duration</span>
    <span class="spell-stat-value">
      <% if (spell.concentration) { %><span class="text-orange">Concentration, </span><% } %><%= spell.duration %>
    </span>
  </div>
</div>
```

Also remove the two `<hr class="w-75" />` tags that flanked the old stat block (the one before the stats div and the one after it) — the grid card creates its own visual separation.

**Step 2: Verify visually**

Open a spell page. The four stats should appear in a 2×2 grid card with labeled fields and subtle borders. On mobile, should stack to single column.

**Step 3: Commit**

```bash
git add views/dnd/5e/srd/spell.ejs
git commit -m "feat: spell stat block 2x2 grid layout"
```

---

### Task 8: Monster ability score grid — CSS

**Files:**
- Modify: `public/css/features/info.css`

**Step 1: Add ability grid styles**

```css
/* ===== Monster Ability Score Grid ===== */
.monster-ability-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
  margin: 0.75rem 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-ornate);
  background: var(--border-ornate);
  text-align: center;
}

.ability-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  background: linear-gradient(145deg, var(--blue3) 0%, rgba(31, 37, 49, 0.95) 100%);
}

.ability-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--main-gray);
  font-weight: 700;
}

.ability-score {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--orange3);
  font-family: var(--font-heading, 'YoungSerif', Georgia, serif);
}

.ability-mod {
  font-size: 0.8rem;
  color: var(--light-gray);
}

@media (max-width: 480px) {
  .monster-ability-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Step 2: Commit CSS only**

```bash
git add public/css/features/info.css
git commit -m "style: add monster ability score grid CSS"
```

---

### Task 9: Monster ability score grid — template

**Files:**
- Modify: `views/dnd/5e/srd/monster.ejs`

**Step 1: Replace the two inline-div ability score rows**

Find the `<!-- Ability scores -->` comment and the two `<div class="inline-div">` blocks containing STR/DEX/CON and INT/WIS/CHA. Replace both (including the surrounding `<hr class="w-50" />` tags) with:

```ejs
<!-- Ability scores -->
<div class="monster-ability-grid">
  <div class="ability-cell">
    <span class="ability-label">STR</span>
    <span class="ability-score"><%= monster.strength %></span>
    <span class="ability-mod">(<%= Math.floor((Number(monster.strength) - 10) / 2) >= 0 ? '+' : '' %><%= Math.floor((Number(monster.strength) - 10) / 2) %>)</span>
  </div>
  <div class="ability-cell">
    <span class="ability-label">DEX</span>
    <span class="ability-score"><%= monster.dexterity %></span>
    <span class="ability-mod">(<%= Math.floor((Number(monster.dexterity) - 10) / 2) >= 0 ? '+' : '' %><%= Math.floor((Number(monster.dexterity) - 10) / 2) %>)</span>
  </div>
  <div class="ability-cell">
    <span class="ability-label">CON</span>
    <span class="ability-score"><%= monster.constitution %></span>
    <span class="ability-mod">(<%= Math.floor((Number(monster.constitution) - 10) / 2) >= 0 ? '+' : '' %><%= Math.floor((Number(monster.constitution) - 10) / 2) %>)</span>
  </div>
  <div class="ability-cell">
    <span class="ability-label">INT</span>
    <span class="ability-score"><%= monster.intelligence %></span>
    <span class="ability-mod">(<%= Math.floor((Number(monster.intelligence) - 10) / 2) >= 0 ? '+' : '' %><%= Math.floor((Number(monster.intelligence) - 10) / 2) %>)</span>
  </div>
  <div class="ability-cell">
    <span class="ability-label">WIS</span>
    <span class="ability-score"><%= monster.wisdom %></span>
    <span class="ability-mod">(<%= Math.floor((Number(monster.wisdom) - 10) / 2) >= 0 ? '+' : '' %><%= Math.floor((Number(monster.wisdom) - 10) / 2) %>)</span>
  </div>
  <div class="ability-cell">
    <span class="ability-label">CHA</span>
    <span class="ability-score"><%= monster.charisma %></span>
    <span class="ability-mod">(<%= Math.floor((Number(monster.charisma) - 10) / 2) >= 0 ? '+' : '' %><%= Math.floor((Number(monster.charisma) - 10) / 2) %>)</span>
  </div>
</div>
```

Remove the `<hr class="w-50" />` lines that were above and below the old ability score rows (there were two of them flanking the block). The grid card provides its own visual boundary.

**Step 2: Verify visually**

Open a monster page (e.g. `/dnd/5e/srd/monsters/aboleth`). The six ability scores should appear in a horizontal grid card. Scores in warm orange, modifiers in lighter gray. Positive modifiers should display as `+4`, negative as `-1`.

**Step 3: Commit**

```bash
git add views/dnd/5e/srd/monster.ejs
git commit -m "feat: monster ability score 6-column grid layout"
```

---

### Task 10: Push and open PR

```bash
git push -u origin feat/srd-styling-cleanup
gh pr create \
  --title "feat: SRD fantasy tome polish — texture, ornamental dividers, stat grids" \
  --body "Elevates SRD pages with grain texture, ornamental HR dividers, gradient h1s, spell stat block grid, and monster ability score grid. Pure CSS additions plus two template restructures. No animations, no external assets."
```
