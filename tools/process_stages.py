#!/usr/bin/env python3
"""Resize the generated 21:9 stage backgrounds (raw/s0.png..s2.png) to 1700 px
wide JPEGs in assets/stages/ and record their size and floor line in the manifest.

`g` is the floor line as a fraction of screen height: where fighters' feet stand.
It was picked by eye for each background.
"""
import json
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FLOOR = [0.86, 0.90, 0.80]   # Neon Stream Studio, Rooftop Billboard Row, Creator-Con Main Stage


def main():
    man_path = os.path.join(ROOT, 'assets', 'manifest.json')
    man = json.load(open(man_path))
    man['stages'] = []
    for i, g in enumerate(FLOOR):
        im = Image.open(os.path.join(ROOT, 'raw', 's%d.png' % i)).convert('RGB')
        im = im.resize((1700, round(1700 * im.height / im.width)), Image.LANCZOS)
        name = 'stage-%d.jpg' % (i + 1)
        im.save(os.path.join(ROOT, 'assets', 'stages', name), 'JPEG', quality=80)
        man['stages'].append({'file': name, 'w': im.width, 'h': im.height, 'g': g})
    json.dump(man, open(man_path, 'w'), indent=1)


if __name__ == '__main__':
    main()
