#!/usr/bin/env python3
"""Turn AI-generated sprite sheets into game-ready sprite frames.

Each fighter was generated (Higgsfield, Nano Banana Pro) as ONE 16:9 sheet:
a 4x2 grid of poses on a flat chroma-green (#00FF00) background:

    row 1: idle   walk   punch   kick
    row 2: special block hit     ko

This script, for every sheet in raw/ (raw/c0.png .. raw/c5.png):
  1. chroma-keys the green to alpha and removes green spill from edges,
  2. finds each pose as a connected blob and assigns it to its grid cell,
  3. keeps only the largest blob per cell (drops stray specks), except the
     'special' cell, which keeps every blob so thrown props / fire stay,
  4. crops, scales by 0.5 and saves a WebP per pose in assets/sprites/<id>/,
  5. measures anchors and writes them to assets/manifest.json:
       ax     - x of the body's centre of mass (where the feet stand)
       hx, hy - head point (used to crop the portrait cards)
     Attack poses get their anchor from the idle pose's back edge so the
     fighter doesn't "slide" when an arm or leg extends.

Requires: pip install pillow numpy scipy
"""
import io
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDS = ['rex', 'kira', 'bao', 'dev', 'glam', 'wanda']
POSES = ['idle', 'walk', 'punch', 'kick', 'special', 'block', 'hit', 'ko']
SCALE = 0.5


def chroma_key(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)
    alpha = np.clip(1 - (greenness - 25) / 50, 0, 1)          # soft edge between 25..75
    g2 = np.minimum(g, np.maximum(r, b) + 8)                    # despill
    return np.dstack([r, g2, b, alpha * 255]).astype(np.uint8)


def process_sheet(path, cid, out_dir):
    im = Image.open(path)
    W, H = im.size
    rgba = chroma_key(im)
    mask = ndi.binary_dilation(rgba[..., 3] > 128, iterations=3)
    lab, n = ndi.label(mask)
    objs = ndi.find_objects(lab)
    areas = ndi.sum(mask, lab, range(1, n + 1))
    cells = {}
    for i, (sl, area) in enumerate(zip(objs, areas)):
        if area < 1200:
            continue
        cy, cx = ndi.center_of_mass(mask, lab, i + 1)
        k = (0 if cy < H / 2 else 1) * 4 + min(3, int(cx / (W / 4)))
        cells.setdefault(k, []).append((i + 1, sl, area))
    meta = {}
    for k, pose in enumerate(POSES):
        blobs = cells[k] if pose == 'special' else [max(cells[k], key=lambda c: c[2])]
        ids = [c[0] for c in blobs]
        y0 = min(c[1][0].start for c in blobs); y1 = max(c[1][0].stop for c in blobs)
        x0 = min(c[1][1].start for c in blobs); x1 = max(c[1][1].stop for c in blobs)
        sub = rgba[y0:y1, x0:x1].copy()
        sub[..., 3] = np.where(np.isin(lab[y0:y1, x0:x1], ids), sub[..., 3], 0)
        fim = Image.fromarray(sub, 'RGBA')
        fim = fim.resize((round(fim.width * SCALE), round(fim.height * SCALE)), Image.LANCZOS)
        a = np.asarray(fim)[..., 3] > 100
        l2, n2 = ndi.label(a)
        body = l2 == (1 + int(np.argmax(ndi.sum(a, l2, range(1, n2 + 1))))) if n2 > 1 else a
        ys, xs = np.nonzero(body)
        top = ys.min()
        hy, hx = np.nonzero(body[top:top + int((ys.max() - top) * 0.2)])
        fim.save(os.path.join(out_dir, pose + '.webp'), 'WEBP', quality=82, method=4)
        meta[pose] = dict(w=fim.width, h=fim.height, ax=round(float(xs.mean()), 1),
                          hx=round(float(hx.mean()), 1), hy=round(float(hy.mean() + top), 1),
                          _left=int(xs.min()))
    back = meta['idle']['ax'] - meta['idle']['_left']
    for pose in ('punch', 'kick', 'special'):
        meta[pose]['ax'] = round(meta[pose]['_left'] + back + (20 if pose == 'kick' else 10), 1)
    for m in meta.values():
        m.pop('_left')
    return meta


def main():
    man_path = os.path.join(ROOT, 'assets', 'manifest.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {'chars': {}, 'stages': [], 'audio': []}
    for i, cid in enumerate(IDS):
        src = os.path.join(ROOT, 'raw', 'c%d.png' % i)
        if not os.path.exists(src):
            print('skip', cid, '(no', src + ')'); continue
        out = os.path.join(ROOT, 'assets', 'sprites', cid)
        os.makedirs(out, exist_ok=True)
        man['chars'][cid] = process_sheet(src, cid, out)
        print('processed', cid)
    json.dump(man, open(man_path, 'w'), indent=1)


if __name__ == '__main__':
    main()
