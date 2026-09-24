"""Olah aset mentah undangan contoh hendrawan-larasati ke public/img/hendrawan-larasati.

python scripts/prepare-hendrawan-larasati.py "D:/Projects/Work/Assets/sowanan"
"""

import subprocess
import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageOps

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "D:/Projects/Work/Assets/sowanan")
RAW = SRC / "hendrawan-larasati"
OUT = Path(__file__).resolve().parent.parent / "public/img/hendrawan-larasati"
OUT.mkdir(parents=True, exist_ok=True)

P = {n: RAW / f"pexels-ricky-s-2157293893-{i}.jpg" for n, i in {
    1: 34905648, 2: 34932572, 3: 34932591, 4: 34932593, 5: 34932596,
    6: 34932597, 7: 34932600, 8: 34932603, 9: 34932604,
}.items()}

# nama: (foto, kotak crop relatif x0 y0 x1 y1, lebar maksimal)
CROPS = {
    "hero": (1, (0, 0.03, 1, 0.92), 1200),
    "hero-wide": (8, (0, 0, 1, 1), 1800),
    "groom": (7, (0.05, 0.26, 0.57, 0.694), 900),
    "bride": (7, (0.5, 0.32, 0.98, 0.72), 900),
    "story-1": (5, (0.26, 0, 0.793, 1), 1200),
    "story-2": (2, (0, 0.1, 1, 0.933), 1200),
    "story-3": (9, (0, 0.08, 1, 0.913), 1200),
    "story-4": (3, (0, 0.1, 1, 0.933), 1200),
    "venue": (4, (0, 0.1, 1, 0.933), 1200),
    "spec-1": (6, (0.1, 0.43, 0.36, 0.6), 600),
    "spec-2": (6, (0.12, 0.6, 0.42, 0.8), 600),
    "spec-3": (7, (0.62, 0.64, 0.86, 0.82), 600),
    "spec-4": (7, (0.66, 0.79, 0.99, 0.95), 600),
    "g-1": (6, (0, 0.1, 1, 0.95), 1200),
    "g-2": (5, (0, 0, 1, 1), 1400),
    "g-3": (3, (0, 0, 1, 0.6), 1200),
    "g-4": (2, (0.15, 0.1, 0.95, 0.55), 1200),
    "g-5": (9, (0, 0.1, 1, 1), 1200),
    "g-6": (1, (0, 0.05, 1, 0.55), 1200),
}


def crop(n, box, width):
    im = ImageOps.exif_transpose(Image.open(P[n])).convert("RGB")
    w, h = im.size
    im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    return im


sizes = {}
for name, (n, box, width) in CROPS.items():
    im = crop(n, box, width)
    im.save(OUT / f"{name}.jpg", quality=84, optimize=True, progressive=True)
    sizes[name] = im.size

og = crop(8, (0, 0, 1, 1), 1600)
og = og.crop((0, 0, og.width, round(og.width * 630 / 1200)))
og.resize((1200, 630), Image.LANCZOS).save(OUT / "og.jpg", quality=82, optimize=True, progressive=True)

grain = ImageOps.autocontrast(Image.effect_noise((160, 160), 60)).point(lambda v: 240 + v * 15 // 255)
grain.save(OUT / "grain.webp", lossless=True)

qr = qrcode.QRCode(border=1, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data("CONTOH QRIS UNDANGAN SOWANAN. Bukan untuk pembayaran.")
qr.make_image(fill_color="#1F1B1D", back_color="#FAF7F1").convert("RGB").save(OUT / "qris.png", optimize=True)

music = next(RAW.glob("*.mp3"))
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", str(music), "-ac", "2", "-b:a", "96k",
    "-af", "afade=t=out:st=103:d=4.5", str(OUT / "music.mp3"),
], check=True)

for name, (w, h) in sizes.items():
    print(f"{name:12} {w}x{h}")
for f in sorted(OUT.iterdir()):
    print(f"{f.name:18} {f.stat().st_size // 1024} KB")
