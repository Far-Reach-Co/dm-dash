import { Mistral } from "@mistralai/mistralai";
import { detectCategories, srdData } from "./data.js";
import { findRelevantEntries } from "./indexer.js";
import { redisClient } from "../../lib/socketUsers.js";

// ── Mistral API ───────────────────────────────────────────────────────────────

function getClient(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }
  return new Mistral({ apiKey });
}

async function queryMistral(
  question: string,
  context: string,
): Promise<string> {
  const client = getClient();

  const systemPrompt =
    `You are a knowledgeable D&D 5th Edition rules assistant. Answer the user's question using ONLY the SRD reference data provided below. ` +
    `Be specific, cite names and stats when relevant, and keep answers concise. ` +
    `If the data doesn't contain enough information to answer, say so honestly and provide a helpful suggestion to the user about where they might find more information.\n\n` +
    `FORMATTING RULES:\n` +
    `- When listing items, include a MAXIMUM of 15 items. If more exist, mention how many total and suggest the user browse the full list.\n` +
    `- ONLY the following four categories have detail pages: spells, monsters, equipment, and magic items. Do NOT link to anything else (no links for rules, conditions, classes, races, skills, etc.).\n` +
    `- When mentioning a spell, monster, equipment item, or magic item by name, format it as a markdown link using its [index] value from the data.\n` +
    `  URL patterns: spells → /dnd/5e/srd/spells/{index}, monsters → /dnd/5e/srd/monsters/{index}, equipment → /dnd/5e/srd/equipment/{index}, magic items → /dnd/5e/srd/magic-items/{index}\n` +
    `  Example: [Fireball](/dnd/5e/srd/spells/fireball), [Adult Red Dragon](/dnd/5e/srd/monsters/adult-red-dragon)\n` +
    `--- SRD REFERENCE DATA ---\n${context}`;

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.3,
    maxTokens: 1024,
  });

  return (
    (response.choices?.[0]?.message?.content as string) ||
    "No answer generated."
  );
}

// ── Redis cache ──────────────────────────────────────────────────────────────

const CACHE_PREFIX = "srd-search:";
const CACHE_TTL = 60 * 60; // 1 hour in seconds

function cacheKey(query: string): string {
  return CACHE_PREFIX + query.toLowerCase().trim();
}

async function getCached(query: string): Promise<string | null> {
  try {
    return await redisClient.get(cacheKey(query));
  } catch {
    return null;
  }
}

async function setCache(query: string, answer: string): Promise<void> {
  try {
    await redisClient.setEx(cacheKey(query), CACHE_TTL, answer);
  } catch {
    // Cache write failure is non-fatal
  }
}

// ── Link sanitizer ───────────────────────────────────────────────────────────

const LINKABLE_CATEGORIES: Record<string, string> = {
  spells: "/dnd/5e/srd/spells/",
  monsters: "/dnd/5e/srd/monsters/",
  equipment: "/dnd/5e/srd/equipment/",
  "magic-items": "/dnd/5e/srd/magic-items/",
};

// Build a set of all valid link paths at startup
const validPaths = new Set<string>();
for (const [category, prefix] of Object.entries(LINKABLE_CATEGORIES)) {
  for (const entry of srdData[category] || []) {
    if (entry.index) validPaths.add(prefix + entry.index);
  }
}

function stripInvalidLinks(markdown: string): string {
  // Match markdown links: [text](url)
  return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (validPaths.has(url)) return match;
    // Not a valid page — keep the text, drop the link
    return text;
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function searchSrd(query: string): Promise<string> {
  // Check cache
  const cached = await getCached(query);
  if (cached) return cached;

  // Detect relevant categories
  const categories = detectCategories(query);

  // Find and serialize relevant entries
  const context = findRelevantEntries(query, categories);

  if (!context) {
    return "I couldn't find any relevant SRD data for that query. Try asking about specific spells, monsters, equipment, conditions, or other D&D 5E rules.";
  }

  // Query Mistral and strip any links to pages that don't exist
  const raw = await queryMistral(query, context);
  const answer = stripInvalidLinks(raw);

  // Cache the result
  await setCache(query, answer);

  return answer;
}
