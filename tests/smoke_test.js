// Headless smoke test for CLOUT CLASH.
// Loads index.html in Chromium, walks the menus, plays an arcade round with
// the keyboard, fires all 6 supers, and runs 6 full CPU-vs-CPU matches.
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

  // Every fighter's super must trigger.
  for (let i = 0; i < 6; i++) {
    const got = await page.evaluate(i => {
      const c = window.__cc; c.start(i, (i + 1) % 6, 'demo', i % 3); c.stepN(125); c.meter();
      for (let n = 0; n < 1500; n++) { c.stepN(1); const f = c.F(); if (f[0].st === 'super') return f[0].def.id; }
      return null;
    }, i);
    if (!got) throw new Error('super never fired for fighter ' + i);
    console.log('super OK:', got);
  }

  // Full CPU-vs-CPU matches must end.
  for (let i = 0; i < 6; i++) {
    const r = await page.evaluate(i => {
      const c = window.__cc; c.start(i, (i + 3) % 6, 'demo', i % 3); let last = null;
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
