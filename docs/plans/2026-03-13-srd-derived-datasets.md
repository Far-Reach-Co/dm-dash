# SRD Derived Dataset Priorities

## Goal

Create relationship indexes that turn flat 5e SRD entities into crawlable browse pages, stronger "see also" blocks, and better internal linking across the compendium.

## Rating Method

Score each dataset from 1-10 across:

- Search/page value: how many obvious long-tail pages it can power
- Relationship density: how many SRD entity types it connects
- Data confidence: how structured the source fields are
- Reuse: how broadly the dataset can support routes, templates, sitemap growth, and AI/search linking

## Ranked Datasets

1. `damage-type-relationships` — **9.7/10**
   Powers pages like `fire damage 5e`, `poison immune monsters 5e`, and cross-links between spells, monsters, and rules. Structured fields make this high-confidence and high-utility.

2. `spell-facets` — **9.4/10**
   Powers filter/index families beyond level/school/class: damage type, concentration, ritual, healing, save ability, attack type, area of effect, and components.

3. `monster-facets` — **9.0/10**
   Powers browse pages for monster size, subtype, condition immunity, movement mode, senses, spellcasting monsters, and legendary monsters.

4. `equipment-facets` — **8.8/10**
   Powers better equipment browse pages like finesse weapons, martial ranged weapons, holy symbols, artisan's tools, and proficiency-linked item lists.

5. `race-relationships` — **8.6/10**
   Powers character-builder style pages such as races with darkvision, races with Dexterity bonuses, or races that speak Elvish.

6. `class-relationships` — **8.1/10**
   Useful for internal compendium UX and supporting pages like classes by spellcasting ability, saving throw proficiency, or equipment access. Slightly lower because class detail pages already expose a lot of this.

## Implemented In This Pass

- `5e-srd-damage-type-relationships.json`
- `5e-srd-spell-facets.json`
- `5e-srd-monster-facets.json`
- `5e-srd-equipment-facets.json`
- `5e-srd-race-relationships.json`
- `5e-srd-class-relationships.json`

## First Page Family Shipped

The highest-value relationship dataset now powers:

- `/dnd/5e/srd/damage-types/{index}`

Those pages connect each damage type to:

- SRD spells that deal it
- Monsters that deal it
- Monsters with resistance to it
- Monsters with immunity to it
- Monsters with vulnerability to it

## Best Next Page Families

1. Spell damage type pages from `spell-facets`
   Example: `/dnd/5e/srd/spells/damage/fire`

2. Monster condition immunity pages from `monster-facets`
   Example: `/dnd/5e/srd/monsters/condition-immunity/poisoned`

3. Equipment weapon property pages from `equipment-facets`
   Example: `/dnd/5e/srd/equipment/weapon-property/finesse`

4. Race trait pages from `race-relationships`
   Example: `/dnd/5e/srd/races/trait/darkvision`
