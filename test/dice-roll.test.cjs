const assert = require('node:assert/strict');
const test = require('node:test');
const { require: requireTypeScript } = require('tsx/cjs/api');
const { calculateDiceRollResponse } = requireTypeScript('../src/lib/dice.ts', __filename);

test('/roll totals valid dice and modifiers', () => {
  const originalRandom = Math.random;
  Math.random = () => 0.5;
  try {
    const result = calculateDiceRollResponse('2d6 + 3 - 1');
    assert.match(result, /Roll 1: 4/);
    assert.match(result, /Roll 2: 4/);
    assert.match(result, /TOTAL = 10/);
  } finally {
    Math.random = originalRandom;
  }
});

test('/roll rejects malformed or excessive rolls', () => {
  for (const input of ['2d0', '0d6', '101d6', '2d1001', '2d6hello', '2d6+3garbage']) {
    assert.doesNotMatch(calculateDiceRollResponse(input), /TOTAL =/, input);
  }
});
