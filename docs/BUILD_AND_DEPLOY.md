# Build, test & deploy

## Requirements

| Task | Needs |
|---|---|
| Play | Any modern browser (Chrome, Edge, Firefox, Safari) |
| Build | Python 3.8+ (standard library only) |
| Re-process raw assets | Python with `pillow`, `numpy`, `scipy`; `ffmpeg` |
| Run tests | Node.js 18+ and `playwright-core` (or `playwright`), plus a Chromium/Chrome binary |

## Build

```bash
python3 tools/build.py              # → index.html
python3 tools/build.py -o game.html # custom output
```

`build.py` reads `src/template.html`, replaces `__ASSETS__` with a compact JSON of every sprite, stage and audio file (as base64 data URIs, with metadata from `assets/manifest.json`), replaces `__GAME__` with `src/game.js`, and writes one self-contained HTML file of about 3.8 MB.

The build is deterministic: running it on this repo reproduces the committed `index.html` byte for byte.

```bash
python3 tools/build.py -o /tmp/check.html && cmp /tmp/check.html index.html && echo identical
```

**Commit `index.html` after every change to `src/` or `assets/`**, because GitHub Pages serves the committed file.

## Test

```bash
npm install --no-save playwright-core
CHROME=/usr/bin/google-chrome node tests/smoke_test.js
# or, with full Playwright installed (it downloads its own Chromium):
npm install --no-save playwright && npx playwright install chromium && node tests/smoke_test.js
```

The smoke test:

1. loads the game and waits for the title screen,
2. starts Arcade with the keyboard, picks a fighter, walks and punches,
3. forces a full meter for each of the 12 fighters and checks that their super fires,
4. runs every fighter's second special, checks that a throw beats guard and a dash moves forward,
5. runs a full CPU-vs-CPU match for each of the 12 fighters at accelerated speed and checks that each one ends,
6. fails on any JavaScript error.

## Deploy (GitHub Pages)

The game is hosted at **https://atharvkmore.github.io/clout-clash/**.

Setup used for this repo: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**. The repo contains a `.nojekyll` file, so GitHub serves the files as-is without running Jekyll. Every push to `main` redeploys within about a minute.

Because the game is a single static file, it also works on any static host (Netlify, Vercel, itch.io as an HTML5 game, a USB stick…).

## Add a new fighter

**Quickest way, no new art:** add a palette swap. Give the roster entry `base:'<existing id>'` and a colour transform such as `hue:120, sat:1.1, bri:1`; the six newer fighters work this way. Then pick its moves (step 3 below).

**With new art:**

1. **Generate a sprite sheet** with the prompt template in [ASSET_PIPELINE.md](ASSET_PIPELINE.md): 8 poses in the same order, on chroma green, facing right.
2. Save it as `raw/c6.png`, add the new id to `IDS` in `tools/process_sprites.py`, and run the script. It writes `assets/sprites/<id>/*.webp` and the anchors into `assets/manifest.json`.
3. Add an entry to `ROSTER` in `src/game.js`:

   ```js
   {id:'chef', short:'SIMMER', name:'CHEF SIMMER', niche:'COOKING', color:'#10b981',
    hp:104, speed:4.6, pd:7, kd:10,
    spName:'HOT PAN', suName:'SOUS-VIDE SLAM', sp:'shaker', su:'wave',
    quote:'Taste the heat.'}
   ```

   `sp`/`su` can reuse any existing effect (`shaker, pixel, fire, laser, lipstick, flash` / `slam, bolts, wave, bombs, storm, plane`), or you can add a new case in `doSpecial()` / `doSuper()` plus drawing code in `drawEnt()`.
4. Optionally add an announcer clip `assets/audio/voice/v_<id>.mp3` and list it in `manifest.json` → `audio`.
5. `python3 tools/build.py`, run the smoke test, commit.

The character-select row and the Arcade ladder size themselves from `ROSTER.length`; with more than 6 fighters, adjust the card width in the select-screen renderer.
