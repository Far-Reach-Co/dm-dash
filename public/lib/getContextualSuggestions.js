import getDataByQuery from "./getDataByQuery.js";
import { getSuggestionContext } from "./suggestionContext.js";

const DEFAULT_LIMIT = 20;
const SPELL_CLASS_LEVEL_INDEX_URL =
  "/lib/data/2014/5e-srd-spell-class-level-index.json";
let spellClassLevelIndexPromise = null;

const SPELL_LEVEL_BY_TYPE = {
  cantrip: 0,
  "first level": 1,
  "second level": 2,
  "third level": 3,
  "fourth level": 4,
  "fifth level": 5,
  "sixth level": 6,
  "seventh level": 7,
  "eighth level": 8,
  "nineth level": 9,
  "ninth level": 9,
};

function normalizeString(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function toArray(value) {
  if (!Array.isArray(value)) return [];
  return value;
}

function parseNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function normalizeSpellIndex(value) {
  return String(value || "").trim().toLowerCase();
}

async function loadSpellClassLevelIndex() {
  if (!spellClassLevelIndexPromise) {
    spellClassLevelIndexPromise = fetch(SPELL_CLASS_LEVEL_INDEX_URL)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  }
  const data = await spellClassLevelIndexPromise;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (!data.classes || typeof data.classes !== "object") return null;
  return data;
}

function tokenizeQuery(query) {
  const normalized = normalizeString(query);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter(Boolean);
}

function filterByQueryTokens(data, queryTokens) {
  if (!queryTokens.length) return data.slice();
  return data.filter((item) => {
    const name = normalizeString(item?.name);
    return queryTokens.every((token) => name.includes(token));
  });
}

function getNameScore(name, queryText, queryTokens) {
  const normalizedName = normalizeString(name);
  if (!normalizedName) return Number.NEGATIVE_INFINITY;
  if (!queryTokens.length) return 1;

  let score = 0;
  if (normalizedName === queryText) score += 200;
  if (normalizedName.startsWith(queryText)) score += 120;
  if (normalizedName.includes(queryText)) score += 60;

  for (const token of queryTokens) {
    const idx = normalizedName.indexOf(token);
    if (idx === 0) {
      score += 30;
    } else if (idx > 0) {
      score += 15;
    } else {
      score -= 50;
    }
  }

  return score;
}

function inferSpellLevel(spellType) {
  const normalizedType = normalizeString(spellType);
  if (!normalizedType) return null;
  if (Object.prototype.hasOwnProperty.call(SPELL_LEVEL_BY_TYPE, normalizedType)) {
    return SPELL_LEVEL_BY_TYPE[normalizedType];
  }

  const levelMatch = normalizedType.match(/\b([0-9])\b/);
  if (!levelMatch) return null;
  const level = parseNumber(levelMatch[1]);
  if (level === null) return null;
  return level;
}

function getSpellIndexSetFromContext(indexData, context, metadata) {
  if (!indexData || !indexData.classes || typeof indexData.classes !== "object") {
    return null;
  }

  const contextClassIndexes = toArray(context?.classIndexes)
    .map((value) => normalizeString(value))
    .filter(Boolean);
  if (!contextClassIndexes.length) return null;

  const targetSpellLevel = inferSpellLevel(metadata?.spellType);
  let foundAnyKnownClass = false;
  const spellIndexSet = new Set();

  for (const classIndex of contextClassIndexes) {
    const classRecord = indexData.classes[classIndex];
    if (!classRecord || typeof classRecord !== "object") continue;
    foundAnyKnownClass = true;

    const byLevel =
      classRecord.spellIndexesByLevel &&
      typeof classRecord.spellIndexesByLevel === "object"
        ? classRecord.spellIndexesByLevel
        : {};
    const spellIndexes = targetSpellLevel !== null
      ? toArray(byLevel[String(targetSpellLevel)])
      : toArray(classRecord.spellIndexes);

    for (const spellIndex of spellIndexes) {
      const normalizedSpellIndex = normalizeSpellIndex(spellIndex);
      if (normalizedSpellIndex) spellIndexSet.add(normalizedSpellIndex);
    }
  }

  if (!foundAnyKnownClass) return null;
  return spellIndexSet;
}

function scoreSpellContext(item, context, metadata) {
  let score = 0;

  const contextClassIndexes = toArray(context?.classIndexes);
  const spellClassIndexes = toArray(item?.classes)
    .map((cls) => normalizeString(cls?.index))
    .filter(Boolean);

  if (contextClassIndexes.length) {
    let classMatchCount = 0;
    for (const contextClass of contextClassIndexes) {
      if (spellClassIndexes.includes(contextClass)) classMatchCount++;
    }

    if (classMatchCount > 0) {
      score += 80 + (classMatchCount - 1) * 10;
    } else {
      score -= 25;
    }
  }

  const targetSpellLevel = inferSpellLevel(metadata?.spellType);
  const spellLevel = parseNumber(item?.level);
  if (targetSpellLevel !== null && spellLevel !== null) {
    const levelDiff = Math.abs(spellLevel - targetSpellLevel);
    if (levelDiff === 0) {
      score += 70;
    } else if (levelDiff === 1) {
      score += 15;
    } else {
      score -= 20;
    }
  }

  return score;
}

function scoreFeatContext(item, context, metadata) {
  let score = 0;

  const featType = normalizeString(metadata?.featType);
  const contextClassIndexes = toArray(context?.classIndexes);
  const contextRaceIndexes = toArray(context?.raceIndexes);

  const featClassIndex = normalizeString(item?.class?.index);
  const featRaceIndexes = toArray(item?.races)
    .map((race) => normalizeString(race?.index))
    .filter(Boolean);

  const classMatch =
    featClassIndex && contextClassIndexes.includes(featClassIndex);
  const raceMatch = featRaceIndexes.some((raceIndex) =>
    contextRaceIndexes.includes(raceIndex),
  );

  if (featType === "class") {
    if (featClassIndex) {
      if (classMatch) score += 90;
      else if (contextClassIndexes.length) score -= 30;
    } else if (featRaceIndexes.length) {
      score -= 10;
    }
  } else if (featType === "race") {
    if (featRaceIndexes.length) {
      if (raceMatch) score += 80;
      else if (contextRaceIndexes.length) score -= 30;
    } else if (featClassIndex) {
      score -= 10;
    }
  } else {
    if (classMatch) score += 20;
    if (raceMatch) score += 20;
  }

  const featLevel = parseNumber(item?.level);
  if (featLevel !== null && featClassIndex) {
    const classLevelsByIndex =
      context && typeof context.classLevelsByIndex === "object"
        ? context.classLevelsByIndex
        : {};
    const classLevel = parseNumber(classLevelsByIndex[featClassIndex]);
    const fallbackLevel = parseNumber(context?.level);
    const effectiveLevel = classLevel !== null ? classLevel : fallbackLevel;

    if (effectiveLevel !== null) {
      if (featLevel <= effectiveLevel) {
        score += 20;
      } else {
        score -= 20 + Math.min(25, (featLevel - effectiveLevel) * 4);
      }
    }
  }

  return score;
}

function scoreItemByDomain(item, domain, context, metadata) {
  if (domain === "spell") {
    return scoreSpellContext(item, context, metadata);
  }
  if (domain === "feat") {
    return scoreFeatContext(item, context, metadata);
  }
  return 0;
}

function rankSuggestions(data, query, domain, context, metadata) {
  const queryText = normalizeString(query);
  const queryTokens = tokenizeQuery(queryText);
  const candidates = filterByQueryTokens(data, queryTokens);

  return candidates
    .map((item) => {
      const baseScore = getNameScore(item?.name, queryText, queryTokens);
      const contextScore = scoreItemByDomain(item, domain, context, metadata);
      return {
        item,
        baseScore,
        contextScore,
        totalScore: baseScore + contextScore,
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.baseScore !== a.baseScore) return b.baseScore - a.baseScore;
      return String(a.item?.name || "").localeCompare(String(b.item?.name || ""));
    })
    .map((entry) => entry.item);
}

export default async function getContextualSuggestions({
  data = [],
  query = "",
  domain = "",
  generalId = null,
  generalData = null,
  metadata = {},
  limit = DEFAULT_LIMIT,
} = {}) {
  if (!Array.isArray(data) || !data.length) return [];

  try {
    const context = await getSuggestionContext({
      generalId,
      generalData,
    });
    let candidateData = data;
    if (domain === "spell") {
      const spellClassLevelIndex = await loadSpellClassLevelIndex();
      const spellIndexSet = getSpellIndexSetFromContext(
        spellClassLevelIndex,
        context,
        metadata,
      );

      if (spellIndexSet) {
        if (!spellIndexSet.size) return [];
        candidateData = data.filter((item) =>
          spellIndexSet.has(normalizeSpellIndex(item?.index)),
        );
      }
    }

    const ranked = rankSuggestions(candidateData, query, domain, context, metadata);
    return ranked.slice(0, limit);
  } catch {
    // Hard fallback to current behavior when context/ranking fails.
    return getDataByQuery(data, query).slice(0, limit);
  }
}
