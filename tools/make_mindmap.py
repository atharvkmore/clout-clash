#!/usr/bin/env python3
"""Draw docs/mindmap.svg: a clean, deterministic radial mindmap of the project.

Edit TREE below and re-run:  python3 tools/make_mindmap.py
"""
import os
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (branch, colour, side, [leaves])
TREE = [
    ('Roster', '#a855f7', 'L', [
        'Rex Ironreps · Fitness · Protein Shot / Leg Day',
        'Kira Framerate · Gaming · Pixel Blast / Rage Quit',
        'Big Bao · Mukbang · Chili Breath / Noodle Tsunami',
        'Dev Gadget · Tech · Phone Laser / Drone Strike',
        'Lady Contour · Beauty · Lipstick Missile / Glitter Storm',
        'Wanda Lust · Travel · Flash! / First Class',
        'Max Hustle · Finance · Stonks Arrow / Market Crash',
        'Luna Whisper · ASMR · Whisper Wave / Tingle Trance',
        'Big Mic · Podcasts · Hot Take / 3-Hour Episode',
        'Jax Jolt · Pranks · Whoopee Mine / Cake Prank',
        'Zara Steps · Dance · Trend Spin / Viral Challenge',
        'Sage Bloom · Wellness · Chakra Palm / Inner Peace',
    ]),
    ('Gameplay', '#0ea5e9', 'L', [
        'Best of 3 rounds · 60 s timer',
        'Punch → punch → launcher chain',
        'Air kicks and juggles',
        'Guard with chip damage',
        'Combo damage scaling (min 45%)',
        'Second special on Down + Special',
        'Dash, invincible backdash, throws beat guard',
        'Super meter from dealing and taking hits',
    ]),
    ('Modes', '#ef4444', 'L', [
        'Arcade ladder · 6 rivals · rising AI',
        '2-player local Versus',
        'CPU vs CPU demo',
    ]),
    ('Concept', '#f59e0b', 'R', [
        'Tekken-inspired 2D fighter',
        'Original parody influencers',
        'Powers drawn from content niche',
    ]),
    ('Engine', '#10b981', 'R', [
        'Vanilla JS + Canvas 2D, no dependencies',
        'Fixed 60 Hz loop, renders at any refresh rate',
        'Scene + fighter state machines',
        'Hit-stop, screen shake, particles',
        'CPU AI uses the same input path as players',
        'Web Audio: music, voice, synthesized SFX',
    ]),
    ('Assets', '#ff2d87', 'R', [
        'Higgsfield AI: 6 sprite sheets, 3 stages',
        '6 extra fighters = in-code palette swaps',
        'AI music loops + announcer voice',
        'Chroma key, slicing, foot/head anchors',
        'Total generation cost ≈ 26 credits',
    ]),
    ('Delivery', '#6c5ce7', 'R', [
        'build.py → one 3.8 MB offline index.html',
        'Byte-identical, reproducible builds',
        'Headless Chrome smoke test',
        'GitHub Pages hosting + touch controls',
    ]),
]

W, H = 1900, 1180
CX, CY = W / 2, H / 2
LEAF_H, LEAF_GAP, GROUP_GAP = 30, 8, 26
FONT = 'Arial, Helvetica, sans-serif'


def text_w(s, size):
    """Rough Arial text width; good enough for sizing pills."""
    narrow = sum(1 for c in s if c in 'iljtf.,·:;!|() /\'')
    wide = sum(1 for c in s if c in 'MWmw@%')
    return size * (0.55 * (len(s) - narrow - wide) + 0.28 * narrow + 0.85 * wide)


def side_layout(groups):
    total = sum(len(l) * (LEAF_H + LEAF_GAP) - LEAF_GAP for _, _, _, l in groups) + GROUP_GAP * (len(groups) - 1)
    y = CY - total / 2
    out = []
    for g in groups:
        leaves = g[3]
        h = len(leaves) * (LEAF_H + LEAF_GAP) - LEAF_GAP
        ys = [y + i * (LEAF_H + LEAF_GAP) + LEAF_H / 2 for i in range(len(leaves))]
        out.append((g, ys, y + h / 2))
        y += h + GROUP_GAP
    return out


def main():
    p = []
    p.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">')
    p.append('<defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffd23d"/>'
             '<stop offset=".55" stop-color="#ff7a1a"/><stop offset="1" stop-color="#ff2d87"/></radialGradient>'
             '<filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity=".25"/></filter></defs>')
    p.append(f'<rect width="{W}" height="{H}" fill="#14111f"/>')
    p.append(f'<text x="{CX}" y="44" fill="#ffffff" font-size="26" font-weight="700" text-anchor="middle">CLOUT CLASH · project mindmap</text>')
    for side in 'LR':
        groups = [g for g in TREE if g[2] == side]
        sgn = -1 if side == 'L' else 1
        bx = CX + sgn * 290                 # branch node x (centre)
        lx = CX + sgn * 420                 # leaf pill inner edge
        for (name, col, _, leaves), ys, by in side_layout(groups):
            # trunk: root -> branch
            p.append(f'<path d="M{CX + sgn * 95},{CY} C{CX + sgn * 190},{CY} {bx - sgn * 120},{by} {bx - sgn * 62},{by}" '
                     f'stroke="{col}" stroke-width="7" fill="none" stroke-linecap="round"/>')
            for ly, leaf in zip(ys, leaves):
                p.append(f'<path d="M{bx + sgn * 62},{by} C{bx + sgn * 100},{by} {lx - sgn * 50},{ly} {lx},{ly}" '
                         f'stroke="{col}" stroke-width="2.5" fill="none" opacity=".85"/>')
                tw = text_w(leaf, 15) + 26
                x0 = lx if side == 'R' else lx - tw
                p.append(f'<rect x="{x0:.1f}" y="{ly - LEAF_H / 2:.1f}" width="{tw:.1f}" height="{LEAF_H}" rx="15" '
                         f'fill="#221d33" stroke="{col}" stroke-width="2"/>')
                p.append(f'<text x="{x0 + tw / 2:.1f}" y="{ly + 5:.1f}" fill="#f4f1ff" font-size="15" text-anchor="middle">{escape(leaf)}</text>')
            p.append(f'<rect x="{bx - 62}" y="{by - 21}" width="124" height="42" rx="21" fill="{col}" filter="url(#s)"/>')
            p.append(f'<text x="{bx}" y="{by + 7}" fill="#ffffff" font-size="19" font-weight="700" text-anchor="middle">{escape(name)}</text>')
    p.append(f'<circle cx="{CX}" cy="{CY}" r="96" fill="url(#g)" stroke="#ffffff" stroke-width="5" filter="url(#s)"/>')
    p.append(f'<text x="{CX}" y="{CY - 6}" fill="#1a0b2e" font-size="31" font-weight="900" font-style="italic" text-anchor="middle">CLOUT</text>')
    p.append(f'<text x="{CX}" y="{CY + 28}" fill="#1a0b2e" font-size="31" font-weight="900" font-style="italic" text-anchor="middle">CLASH</text>')
    p.append('</svg>')
    out = os.path.join(ROOT, 'docs', 'mindmap.svg')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(p))
    print('wrote', out)


if __name__ == '__main__':
    main()
