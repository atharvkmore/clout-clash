#!/usr/bin/env python3
"""Build CLOUT CLASH into one self-contained, offline HTML file.

Reads src/template.html, src/game.js, assets/manifest.json and every file in
assets/, embeds them as base64 data URIs, and writes index.html (the file that
GitHub Pages serves and that players can download and open offline).

Usage:
    python3 tools/build.py              # writes ./index.html
    python3 tools/build.py -o dist.html # custom output path
"""
import argparse
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIME = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg'}


def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (MIME[ext], base64.b64encode(f.read()).decode())


def build_assets():
    a = os.path.join(ROOT, 'assets')
    with open(os.path.join(a, 'manifest.json')) as f:
        man = json.load(f)
    chars = {}
    for cid, poses in man['chars'].items():
        frames = {}
        for pose, meta in poses.items():
            frames[pose] = {'s': data_uri(os.path.join(a, 'sprites', cid, pose + '.webp'))}
            frames[pose].update(meta)  # w, h, ax (foot anchor x), hx/hy (head point)
        chars[cid] = {'frames': frames}
    stages = []
    for s in man['stages']:
        stages.append({'s': data_uri(os.path.join(a, 'stages', s['file'])), 'w': s['w'], 'h': s['h'], 'g': s['g']})
    audio = {}
    for name in man['audio']:
        sub = 'music' if name.startswith('m_') else 'voice'
        audio[name] = data_uri(os.path.join(a, 'audio', sub, name + '.mp3'))
    return {'chars': chars, 'stages': stages, 'audio': audio}


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('-o', '--out', default=os.path.join(ROOT, 'index.html'))
    args = ap.parse_args()
    with open(os.path.join(ROOT, 'src', 'template.html'), encoding='utf-8') as f:
        tpl = f.read()
    with open(os.path.join(ROOT, 'src', 'game.js'), encoding='utf-8') as f:
        game = f.read()
    assets = json.dumps(build_assets(), separators=(',', ':'))
    html = tpl.replace('__ASSETS__', assets).replace('__GAME__', game)
    with open(args.out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('wrote %s (%.2f MB)' % (args.out, len(html.encode()) / 1e6))


if __name__ == '__main__':
    main()
