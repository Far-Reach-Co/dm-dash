const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { require: requireTypeScript } = require('tsx/cjs/api');
const { registerSrdEditionView } = requireTypeScript('../src/dnd/srd/editionView.ts', __filename);

const data = (edition, category) => JSON.parse(fs.readFileSync(path.join(__dirname, `../public/lib/data/${edition}/5e-srd-${category}.json`)));

test('the same SRD URL changes edition and does not carry 2014 copy into 2024', async (t) => {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use((req, _res, next) => { req.session = {}; next(); });
  const router = express.Router();
  registerSrdEditionView(router);
  router.get('/5e/srd/spells/:index', (req, res) => res.json({ legacy: true, edition: res.locals.srdEdition, available: res.locals.srd2024Available }));
  app.use('/dnd', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/dnd/5e/srd/spells/`;

  const shared = 'acid-arrow';
  const original = await (await fetch(base + shared)).json();
  assert.deepEqual(original, { legacy: true, edition: '2014', available: true });
  const updated = await fetch(base + shared + '?edition=2024');
  assert.equal(updated.status, 200);
  const page = await updated.text();
  assert.match(page, /A shimmering green arrow/);
  assert.match(page, /aria-current="true">2024/);
  assert.match(page, /\/dnd\/5e\/srd\/spells\?edition=2024/);
  assert.doesNotMatch(page, /2014 rules reference/);
  assert.doesNotMatch(page, /href="\/api\/2024\//);

  const missing = data('2014', 'spells').find(item => !data('2024', 'spells').some(next => next.index === item.index));
  assert.ok(missing);
  const redirected = await fetch(base + missing.index + '?edition=2024&source=bookmark', { redirect: 'manual' });
  assert.equal(redirected.status, 302);
  assert.equal(redirected.headers.get('location'), `/dnd/5e/srd/spells/${missing.index}?source=bookmark`);
  const legacy = await (await fetch(base + missing.index)).json();
  assert.equal(legacy.available, false);

  const newOnly = data('2024', 'spells').find(item => !data('2014', 'spells').some(old => old.index === item.index));
  assert.ok(newOnly);
  const newPage = await fetch(base + newOnly.index + '?edition=2024');
  assert.equal(newPage.status, 200);
  assert.match(await newPage.text(), /title="Unavailable" aria-disabled="true">2014/);
});

test('2024 class, monster, and filter content comes from the chosen edition', async (t) => {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use((req, _res, next) => { req.session = {}; next(); });
  const router = express.Router();
  registerSrdEditionView(router);
  app.use('/dnd', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/dnd/5e/srd/`;
  const checks = [
    ['classes/barbarian', ['Progression Table', 'Proficiency Bonus', 'Core Features']],
    ['monsters/aboleth', ['Hit Points:', '150']],
    ['spells/level/2', ['Acid Arrow']],
    ['equipment', ['Magic item', 'Poisons']],
    ['weapon-properties', ['Weapon Mastery Properties']],
    ['features/monk-evasion', ['Class:', 'Level:', 'Frequently Asked Questions', 'More Monk Features', '2024 Rules Reference']],
    ['skills', ['id="acrobatics"', '[DEX]', 'Stay on your feet in a tricky situation']],
    ['languages', ['Full List of D&amp;D 5E Languages', '19 languages', 'id="primordial"', 'Primordial includes the Aquan']],
    ['feats', ['id="boon-of-spell-recall"', 'Level 19 or higher', 'Spellcasting feature', 'Free Casting.']],
  ];
  for (const [target, content] of checks) {
    const response = await fetch(`${base}${target}?edition=2024`);
    assert.equal(response.status, 200, target);
    const html = await response.text();
    for (const text of content) assert.ok(html.includes(text), `${target}: ${text}`);
  }
  for (const [target, heading] of [
    ['spells/level/2', 'Level 2 Spells'],
    ['spells/school/evocation', 'Evocation Spells'],
    ['spells/class/wizard', 'Wizard Spells'],
    ['spells/damage/fire', 'Fire Damage Spells'],
  ]) {
    const response = await fetch(`${base}${target}?edition=2024`);
    assert.equal(response.status, 200, target);
    const html = await response.text();
    assert.ok(html.includes(`<h2>${heading}</h2>`), target);
    assert.match(html, /aria-current="page"/);
    assert.match(html, /Clear filter/);
  }
  const absent = await fetch(`${base}spells/level/100?edition=2024`, { redirect: 'manual' });
  assert.equal(absent.status, 302);
  assert.equal(absent.headers.get('location'), '/dnd/5e/srd/spells/level/100');
});
