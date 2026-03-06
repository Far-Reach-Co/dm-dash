import { getSheet, readSheet } from "./sheetApi.js";

const CONTEXT_TTL_MS = 15_000;
const contextCache = new Map();

let classesDataPromise = null;

function normalizeString(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value) {
  return normalizeString(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function toArray(value) {
  if (!Array.isArray(value)) return [];
  return value;
}

function parsePositiveNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function collectClassTexts(generalData, generalSection, classRows) {
  const classTexts = [];
  const push = (value) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed.length) classTexts.push(trimmed);
  };

  push(generalData?.class);
  push(generalData?.other_class);
  push(generalSection.class);
  push(generalSection.other_class);

  for (const row of classRows) {
    const rowData = toRecord(row);
    push(rowData.class);
  }

  return classTexts;
}

function collectRaceTexts(generalData, generalSection) {
  const raceTexts = [];
  const push = (value) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed.length) raceTexts.push(trimmed);
  };

  push(generalData?.race);
  push(generalSection.race);
  return raceTexts;
}

function resolveRaceIndexes(raceTexts) {
  const raceIndexes = new Set();
  for (const raceText of raceTexts) {
    const parts = String(raceText)
      .split(/[(),/|]+/g)
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      const slug = slugify(part);
      if (slug) raceIndexes.add(slug);

      const words = normalizeString(part).split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        const lastWordSlug = slugify(words[words.length - 1]);
        if (lastWordSlug) raceIndexes.add(lastWordSlug);
      }
    }
  }

  return Array.from(raceIndexes);
}

function buildClassMatchers(classesData) {
  return classesData
    .map((item) => {
      const index = slugify(item?.index || item?.name);
      const name = normalizeString(item?.name);
      if (!index && !name) return null;

      const nameWords = String(name).replace(/[^a-z0-9]+/g, " ").trim();
      const indexWords = String(index).replace(/-/g, " ").trim();

      return {
        index,
        name,
        nameWords,
        indexWords,
      };
    })
    .filter(Boolean);
}

function resolveClassIndexes(rawClassText, classMatchers) {
  const normalized = normalizeString(rawClassText);
  if (!normalized) return [];

  const slug = slugify(normalized);
  const normalizedWords = ` ${normalized.replace(/[^a-z0-9]+/g, " ").trim()} `;
  const slugWords = ` ${slug.replace(/-/g, " ").trim()} `;

  const matches = new Set();

  for (const matcher of classMatchers) {
    if (!matcher?.index) continue;

    if (
      normalized === matcher.name ||
      normalized === matcher.index ||
      slug === matcher.index
    ) {
      matches.add(matcher.index);
      continue;
    }

    if (matcher.nameWords && normalizedWords.includes(` ${matcher.nameWords} `)) {
      matches.add(matcher.index);
      continue;
    }

    if (
      matcher.indexWords &&
      (normalizedWords.includes(` ${matcher.indexWords} `) ||
        slugWords.includes(` ${matcher.indexWords} `))
    ) {
      matches.add(matcher.index);
    }
  }

  return Array.from(matches);
}

function resolveClassLevels(classRows, classMatchers) {
  const classLevelsByIndex = {};

  for (const row of classRows) {
    const rowData = toRecord(row);
    const classIndexes = resolveClassIndexes(rowData.class, classMatchers);
    if (!classIndexes.length) continue;

    const rowLevel = parsePositiveNumber(rowData.total_hit_dice);
    if (rowLevel === null) continue;

    for (const classIndex of classIndexes) {
      classLevelsByIndex[classIndex] = Math.max(
        classLevelsByIndex[classIndex] || 0,
        rowLevel,
      );
    }
  }

  return classLevelsByIndex;
}

async function loadClassesData() {
  if (!classesDataPromise) {
    classesDataPromise = fetch("/lib/data/2014/5e-srd-classes.json")
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);
  }

  const data = await classesDataPromise;
  return Array.isArray(data) ? data : [];
}

async function loadSheetDocument(generalId) {
  if (!generalId) return {};
  const response = await getSheet(generalId, { notifyOnError: false });
  return toRecord(readSheet(response));
}

async function buildSuggestionContext({ generalId, generalData }) {
  const classesData = await loadClassesData();
  const classMatchers = buildClassMatchers(classesData);

  const sheet = await loadSheetDocument(generalId);
  const generalSection = toRecord(sheet.general);
  const classRows = toArray(sheet.classes);

  const classTexts = collectClassTexts(generalData, generalSection, classRows);
  const classIndexes = new Set();
  const customClassNames = new Set();

  for (const classText of classTexts) {
    const matchedClassIndexes = resolveClassIndexes(classText, classMatchers);
    if (matchedClassIndexes.length) {
      for (const classIndex of matchedClassIndexes) {
        classIndexes.add(classIndex);
      }
    } else {
      customClassNames.add(classText);
    }
  }

  const classLevelsByIndex = resolveClassLevels(classRows, classMatchers);
  const level =
    parsePositiveNumber(generalData?.level) ||
    parsePositiveNumber(generalSection.level);

  if (level && classIndexes.size === 1) {
    const onlyClass = Array.from(classIndexes)[0];
    if (!classLevelsByIndex[onlyClass]) {
      classLevelsByIndex[onlyClass] = level;
    }
  }

  const raceIndexes = resolveRaceIndexes(
    collectRaceTexts(generalData, generalSection),
  );

  return {
    classIndexes: Array.from(classIndexes),
    customClassNames: Array.from(customClassNames),
    classLevelsByIndex,
    level: level || null,
    raceIndexes,
  };
}

export async function getSuggestionContext({
  generalId = null,
  generalData = null,
} = {}) {
  const resolvedGeneralId = parsePositiveNumber(generalId || generalData?.id);
  if (!resolvedGeneralId) {
    return buildSuggestionContext({
      generalId: null,
      generalData: toRecord(generalData),
    });
  }

  const now = Date.now();
  const cached = contextCache.get(resolvedGeneralId);
  if (cached?.value && cached.expiresAt > now) {
    return cached.value;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = buildSuggestionContext({
    generalId: resolvedGeneralId,
    generalData: toRecord(generalData),
  })
    .then((context) => {
      contextCache.set(resolvedGeneralId, {
        value: context,
        expiresAt: Date.now() + CONTEXT_TTL_MS,
      });
      return context;
    })
    .catch((err) => {
      contextCache.delete(resolvedGeneralId);
      throw err;
    });

  contextCache.set(resolvedGeneralId, {
    promise,
    expiresAt: now + CONTEXT_TTL_MS,
  });

  return promise;
}

export function clearSuggestionContextCache(generalId) {
  const resolvedGeneralId = parsePositiveNumber(generalId);
  if (!resolvedGeneralId) {
    contextCache.clear();
    return;
  }
  contextCache.delete(resolvedGeneralId);
}
