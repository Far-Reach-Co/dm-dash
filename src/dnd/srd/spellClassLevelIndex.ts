export const SPELL_CLASS_LEVEL_INDEX_FILE = "5e-srd-spell-class-level-index.json";

export type SpellClassLevelIndexEntry = {
  index: string;
  label: string;
  levels: number[];
  spellIndexes: string[];
  spellIndexesByLevel: Record<string, string[]>;
};

export type SpellClassLevelIndexData = {
  version: number;
  source?: string;
  generatedAt?: string;
  classes: Record<string, SpellClassLevelIndexEntry>;
};

export function normalizeClassIndex(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export function buildSpellClassLevelIndex(
  classesData: any[],
  spellsData: any[],
  opts?: { source?: string; generatedAt?: string },
): SpellClassLevelIndexData {
  const records = new Map<
    string,
    {
      label: string;
      levels: Set<number>;
      spellIndexes: Set<string>;
      spellIndexesByLevel: Map<number, Set<string>>;
    }
  >();

  for (const classItem of classesData || []) {
    const classIndex = normalizeClassIndex(classItem?.index);
    if (!classIndex || records.has(classIndex)) continue;
    records.set(classIndex, {
      label: String(classItem?.name || classIndex).trim() || classIndex,
      levels: new Set<number>(),
      spellIndexes: new Set<string>(),
      spellIndexesByLevel: new Map<number, Set<string>>(),
    });
  }

  for (const spell of spellsData || []) {
    const spellIndex = normalizeClassIndex(spell?.index);
    if (!spellIndex) continue;
    const spellLevel = Number(spell?.level);
    const normalizedLevel =
      Number.isInteger(spellLevel) && spellLevel >= 0 ? spellLevel : null;

    for (const classRef of spell?.classes || []) {
      const classIndex = normalizeClassIndex(classRef?.index);
      if (!classIndex) continue;

      const existing = records.get(classIndex);
      const record =
        existing ||
        {
          label: String(classRef?.name || classIndex).trim() || classIndex,
          levels: new Set<number>(),
          spellIndexes: new Set<string>(),
          spellIndexesByLevel: new Map<number, Set<string>>(),
        };

      if (!existing) {
        records.set(classIndex, record);
      }

      record.spellIndexes.add(spellIndex);
      if (normalizedLevel !== null) {
        record.levels.add(normalizedLevel);
        const byLevel = record.spellIndexesByLevel.get(normalizedLevel) || new Set<string>();
        byLevel.add(spellIndex);
        record.spellIndexesByLevel.set(normalizedLevel, byLevel);
      }
    }
  }

  const spellNameByIndex = new Map<string, string>();
  for (const spell of spellsData || []) {
    const spellIndex = normalizeClassIndex(spell?.index);
    if (!spellIndex) continue;
    spellNameByIndex.set(spellIndex, String(spell?.name || spellIndex));
  }

  const sortSpellIndexes = (values: Iterable<string>) =>
    Array.from(values).sort((a, b) =>
      String(spellNameByIndex.get(a) || a).localeCompare(
        String(spellNameByIndex.get(b) || b),
      ),
    );

  const classes: Record<string, SpellClassLevelIndexEntry> = {};
  for (const [classIndex, record] of records.entries()) {
    const levels = Array.from(record.levels).sort((a, b) => a - b);
    const spellIndexesByLevel: Record<string, string[]> = {};
    for (const level of levels) {
      spellIndexesByLevel[String(level)] = sortSpellIndexes(
        record.spellIndexesByLevel.get(level) || [],
      );
    }

    classes[classIndex] = {
      index: classIndex,
      label: record.label || classIndex,
      levels,
      spellIndexes: sortSpellIndexes(record.spellIndexes),
      spellIndexesByLevel,
    };
  }

  return {
    version: 1,
    ...(opts?.source ? { source: opts.source } : {}),
    ...(opts?.generatedAt ? { generatedAt: opts.generatedAt } : {}),
    classes,
  };
}
