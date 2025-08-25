export function calculateDiceRollResponse(input: string): string {
  const raw = input.trim().toLowerCase();

  // Match "<amount>d<sides>" plus modifiers
  const coreMatch = raw.match(/^(\d+)\s*d\s*(\d+)(.*)?$/);
  if (!coreMatch) {
    return `Invalid dice notation: "${input}". Try like "2d6+3" or "1d20-2".`;
  }

  const amount = parseInt(coreMatch[1], 10);
  const sides = parseInt(coreMatch[2], 10);
  const tail = (coreMatch[3] || "").trim();

  // Parse modifiers, tolerate spaces like "+ 4 - 2"
  const modifierMatches = tail.match(/[+-]\s*\d+/g) || [];
  const modifiers = modifierMatches.map(
    (m) => parseInt(m.replace(/\s+/g, ""), 10) // remove spaces before parsing
  );

  // Roll dice
  const rolls: number[] = [];
  for (let i = 0; i < amount; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  // Totals
  const rollSum = rolls.reduce((a, b) => a + b, 0);
  const modSum = modifiers.reduce((a, b) => a + b, 0);
  const total = rollSum + modSum;

  // Build string response
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
