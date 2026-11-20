// Headless smoke test for CLOUT CLASH.
// Loads index.html in Chromium, walks the menus, plays an arcade round with
// the keyboard, fires every fighter's super and second special, checks
// throws and dashes, and runs a full CPU-vs-CPU match for every fighter.
// Fails (exit 1) on any page error or if a match never finishes.
//
//   npm i -D playwright-core        (or use any Playwright install)
//   CHROME=/path/to/chrome node tests/smoke_test.js
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('playwright-core')); }

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForFunction(() => window.__cc && window.__cc.scene() === 'title', null, { timeout: 15000 });
  console.log('title screen OK');

  // Arcade: pick a fighter with the keyboard and start fighting.
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  await page.keyboard.press('KeyD'); await page.keyboard.press('KeyF');
  await page.waitForFunction(() => window.__cc.scene() === 'vs', null, { timeout: 5000 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__cc.phase() === 'fight', null, { timeout: 8000 });
  await page.keyboard.down('KeyD'); await page.waitForTimeout(900); await page.keyboard.up('KeyD');
  for (let i = 0; i < 4; i++) { await page.keyboard.press('KeyF'); await page.waitForTimeout(200); }
  console.log('arcade input OK', JSON.stringify(await page.evaluate(() => window.__cc.info().f)));

  const roster = await page.evaluate(() => window.__cc.roster());
  const N = roster.length;
  console.log('roster (' + N + '):', roster.join(', '));

  // Every fighter's super must trigger.
  for (let i = 0; i < N; i++) {
    const got = await page.evaluate(i => {
      const c = window.__cc; c.start(i, (i + 1) % 12, 'demo', i % 3); c.stepN(125); c.meter();
      for (let n = 0; n < 1500; n++) { c.stepN(1); const f = c.F(); if (f[0].st === 'super') return f[0].def.id; }
      return null;
    }, i);
    if (!got) throw new Error('super never fired for fighter ' + i);
    console.log('super OK:', got);
  }

  // Every fighter's second special runs to completion without errors.
  for (let i = 0; i < N; i++) {
    const r = await page.evaluate(i => {
      const c = window.__cc; c.start(i, (i + 6) % 12, 'versus', i % 3); c.stepN(125);
      c.act(0, 'special2'); let seen = false;
      for (let n = 0; n < 120; n++) { c.stepN(1); if (c.F()[0].st === 'special2') seen = true; }
      return { seen, st: c.F()[0].st, hp: c.info().f.map(f => f.hp) };
    }, i);
    if (!r.seen) throw new Error('special 2 did not run for ' + roster[i]);
    console.log('special 2 OK:', roster[i], JSON.stringify(r.hp));
  }

  // Throw beats guard; dash moves forward.
  const tr = await page.evaluate(() => {
    const c = window.__cc; c.start(0, 2, 'versus', 0); c.stepN(125);
    const f = c.F(); f[0].x = 800; f[1].x = 880; c.hold('KeyD', true); c.hold('ArrowRight', true); c.stepN(2);
    c.press('KeyF'); c.stepN(12); c.hold('KeyD', false); c.hold('ArrowRight', false);
    const thrown = c.F()[1].st; const hp = c.F()[1].hp;
    c.start(1, 3, 'versus', 0); c.stepN(125); const x0 = c.F()[0].x;
    c.press('KeyD'); c.stepN(2); c.press('KeyD'); c.stepN(10);
    return { thrown, hp, dashState: c.F()[0].st, moved: Math.round(c.F()[0].x - x0) };
  });
  if (tr.thrown !== 'down') throw new Error('throw failed: ' + JSON.stringify(tr));
  if (tr.moved < 60) throw new Error('dash failed: ' + JSON.stringify(tr));
  console.log('throw + dash OK', JSON.stringify(tr));

  // Full CPU-vs-CPU matches must end.
  for (let i = 0; i < N; i++) {
    const r = await page.evaluate(i => {
      const c = window.__cc; c.start(i, (i + 5) % 12, 'demo', i % 3); let last = null;
      for (let n = 0; n < 40000; n += 20) { c.stepN(20); if (c.scene() !== 'fight') return { done: true, last }; last = c.info().f.map(f => f.id + ' wins=' + f.wins); }
      return { done: false, last };
    }, i);
    if (!r.done) throw new Error('match ' + i + ' never ended');
    console.log('match OK:', r.last.join(' vs '));
  }

  await browser.close();
  if (errors.length) { console.error('PAGE ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('ALL CHECKS PASSED');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
