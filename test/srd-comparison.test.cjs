const assert = require('node:assert/strict');
const test = require('node:test');
const { require: requireTypeScript } = require('tsx/cjs/api');
const { buildSourceComparison } = requireTypeScript('../src/dnd/srd/comparison.ts', __filename);

test('comparison output keeps edition sources separate and links each entry', () => {
  const answer = buildSourceComparison('Compare Barbarian Rage in 2014 and 2024', true);
  assert.match(answer, /2014 SRD — \[Rage\]\(\/dnd\/5e\/srd\/features\/rage\)/);
  assert.match(answer, /2024 SRD — \[Rage\]\(\/dnd\/5e\/srd\/features\/barbarian-rage\?edition=2024\)/);
  assert.equal((answer.match(/SRD —/g) || []).length, 2);
});

test('ambiguous comparisons ask for a specific entry', () => {
  assert.match(buildSourceComparison('Compare old and new Evasion'), /clearly named SRD entry/);
});
