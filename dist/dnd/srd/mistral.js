"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSrd = searchSrd;
const mistralai_1 = require("@mistralai/mistralai");
const data_js_1 = require("./data.js");
const indexer_js_1 = require("./indexer.js");
const socketUsers_js_1 = require("../../lib/socketUsers.js");
function getClient() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        throw new Error("MISTRAL_API_KEY is not configured");
    }
    return new mistralai_1.Mistral({ apiKey });
}
function queryMistral(question, context) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const client = getClient();
        const systemPrompt = `You are a knowledgeable D&D 5th Edition rules assistant. Answer the user's question using ONLY the SRD reference data provided below. ` +
            `Be specific, cite names and stats when relevant, and keep answers concise. ` +
            `If the data doesn't contain enough information to answer, say so honestly and provide a helpful suggestion to the user about where they might find more information.\n\n` +
            `FORMATTING RULES:\n` +
            `- When listing items, include a MAXIMUM of 15 items. If more exist, mention how many total and suggest the user browse the full list.\n` +
            `- ONLY the following four categories have detail pages: spells, monsters, equipment, and magic items. Do NOT link to anything else (no links for rules, conditions, classes, races, skills, etc.).\n` +
            `- When mentioning a spell, monster, equipment item, or magic item by name, format it as a markdown link using its [index] value from the data.\n` +
            `  URL patterns: spells → /dnd/5e/srd/spells/{index}, monsters → /dnd/5e/srd/monsters/{index}, equipment → /dnd/5e/srd/equipment/{index}, magic items → /dnd/5e/srd/magic-items/{index}\n` +
            `  Example: [Fireball](/dnd/5e/srd/spells/fireball), [Adult Red Dragon](/dnd/5e/srd/monsters/adult-red-dragon)\n` +
            `--- SRD REFERENCE DATA ---\n${context}`;
        const response = yield client.chat.complete({
            model: "mistral-small-latest",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question },
            ],
            temperature: 0.3,
            maxTokens: 1024,
        });
        return (((_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) ||
            "No answer generated.");
    });
}
const CACHE_PREFIX = "srd-search:";
const CACHE_TTL = 60 * 60;
function cacheKey(query) {
    return CACHE_PREFIX + query.toLowerCase().trim();
}
function getCached(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield socketUsers_js_1.redisClient.get(cacheKey(query));
        }
        catch (_a) {
            return null;
        }
    });
}
function setCache(query, answer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield socketUsers_js_1.redisClient.setEx(cacheKey(query), CACHE_TTL, answer);
        }
        catch (_a) {
        }
    });
}
const LINKABLE_CATEGORIES = {
    spells: "/dnd/5e/srd/spells/",
    monsters: "/dnd/5e/srd/monsters/",
    equipment: "/dnd/5e/srd/equipment/",
    "magic-items": "/dnd/5e/srd/magic-items/",
};
const validPaths = new Set();
for (const [category, prefix] of Object.entries(LINKABLE_CATEGORIES)) {
    for (const entry of data_js_1.srdData[category] || []) {
        if (entry.index)
            validPaths.add(prefix + entry.index);
    }
}
function stripInvalidLinks(markdown) {
    return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        if (validPaths.has(url))
            return match;
        return text;
    });
}
function searchSrd(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const cached = yield getCached(query);
        if (cached)
            return cached;
        const categories = (0, data_js_1.detectCategories)(query);
        const context = (0, indexer_js_1.findRelevantEntries)(query, categories);
        if (!context) {
            return "I couldn't find any relevant SRD data for that query. Try asking about specific spells, monsters, equipment, conditions, or other D&D 5E rules.";
        }
        const raw = yield queryMistral(query, context);
        const answer = stripInvalidLinks(raw);
        yield setCache(query, answer);
        return answer;
    });
}
