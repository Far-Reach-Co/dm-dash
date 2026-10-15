const requests = new Map();

export function loadSrdSuggestions(edition, category, itemType = category) {
  const key = `${edition}:${category}`;
  if (!requests.has(key)) {
    requests.set(key, fetch(`/lib/data/${edition}/5e-srd-${category}.json`)
      .then((response) => response.ok ? response.json() : [])
      .then((items) => Array.isArray(items)
        ? items.map((item) => ({ ...item, srdEdition: edition, itemType }))
        : [])
      .catch(() => []));
  }
  return requests.get(key);
}

export function suggestionLabel(item) {
  const label = `${item.name} (${item.srdEdition || "2014"})`;
  const className = item.itemType === "features" ? item.class?.name : null;
  return className ? `${label} — ${className}` : label;
}

export function suggestionDescription(item) {
  const value = item.description ?? item.desc ?? "";
  return Array.isArray(value) ? value.join("\n\n") : String(value);
}

export function parseSuggestionQuery(query) {
  const text = String(query || "");
  const edition = text.match(/\b(2014|2024)\b/)?.[1] || null;
  return {
    name: text.replace(/\s*\(?\b(?:2014|2024)\b\)?\s*/g, " ").trim(),
    edition,
  };
}
