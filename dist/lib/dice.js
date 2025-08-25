"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiceRollResponse = void 0;
function calculateDiceRollResponse(input) {
    const raw = input.trim().toLowerCase();
    const coreMatch = raw.match(/^(\d+)\s*d\s*(\d+)(.*)?$/);
    if (!coreMatch) {
        return `Invalid dice notation: "${input}". Try like "2d6+3" or "1d20-2".`;
    }
    const amount = parseInt(coreMatch[1], 10);
    const sides = parseInt(coreMatch[2], 10);
    const tail = (coreMatch[3] || "").trim();
    const modifierMatches = tail.match(/[+-]\s*\d+/g) || [];
    const modifiers = modifierMatches.map((m) => parseInt(m.replace(/\s+/g, ""), 10));
    const rolls = [];
    for (let i = 0; i < amount; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    const rollSum = rolls.reduce((a, b) => a + b, 0);
    const modSum = modifiers.reduce((a, b) => a + b, 0);
    const total = rollSum + modSum;
    let response = `"/roll" Input: ${raw}`;
    rolls.forEach((r, i) => {
        response += `\nRoll ${i + 1}: ${r}${r === sides ? " - *CRITICAL*" : ""}`;
    });
    if (modifiers.length) {
        response += `\nModifiers: ${modifierMatches.join(" ")}`;
    }
    response += `\nTOTAL = ${total}`;
    return response;
}
exports.calculateDiceRollResponse = calculateDiceRollResponse;
