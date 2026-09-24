"""Olah aset mentah undangan contoh andi-rina ke public/img/andi-rina.

python scripts/prepare-andi-rina.py "D:/Projects/Work/Assets/sowanan"
"""

import subprocess
import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageOps

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "D:/Projects/Work/Assets/sowanan")
RAW = SRC / "andi-rina"
OUT = Path(__file__).resolve().parent.parent / "public/img/andi-rina"
OUT.mkdir(parents=True, exist_ok=True)

P = {n: RAW / f"pexels-mornwish-{i}.jpg" for n, i in {
    1: 36412361, 2: 36412364, 3: 36412367, 4: 36412368, 5: 36412369,
    6: 36412809, 7: 36412810, 8: 36412870, 9: 36412872,
}.items()}

# nama: (foto, kotak crop relatif x0 y0 x1 y1, lebar maksimal)
CROPS = {
    "hero": (1, (0, 0.04, 1, 0.93), 1200),
    "hero-wide": (2, (0, 0, 1, 1), 1800),
    "story-1": (4, (0.27, 0.12, 0.68, 0.94), 900),
    "story-2": (2, (0.22, 0, 0.78, 1), 900),
    "story-3": (6, (0, 0.06, 1, 0.94), 900),
    "story-4": (8, (0, 0, 1, 0.89), 900),
    "couple": (5, (0, 0, 1, 1), 1400),
    "polaroid-1": (1, (0, 0, 1, 0.667), 700),
    "polaroid-2": (7, (0, 0.2, 1, 0.867), 700),
    "polaroid-3": (3, (0.17, 0, 0.83, 1), 700),
    "venue": (9, (0.08, 0, 0.92, 1), 1200),
    "g-1": (2, (0.2, 0, 0.8, 0.6), 1000),
    "g-2": (4, (0, 0, 1, 1), 1400),
    "g-3": (7, (0, 0, 1, 1), 900),
    "g-5": (5, (0.1, 0.2, 0.9, 0.73), 1000),
    "g-7": (8, (0.1, 0.4, 0.95, 0.95), 900),
    "g-8": (1, (0, 0.35, 1, 1), 900),
    "closing": (8, (0.45, 0.55, 0.95, 0.9), 700),
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

og = crop(2, (0, 0, 1, 1), 1600)
ratio = 1200 / 630
og = og.crop((0, 0, og.width, round(og.width / ratio))).resize((1200, 630), Image.LANCZOS)
og.save(OUT / "og.jpg", quality=82, optimize=True, progressive=True)

seal = Image.open(next(SRC.glob("*seal*.png"))).convert("RGBA")
seal = seal.crop(seal.getbbox()).resize((360, 360), Image.LANCZOS)
gray = ImageOps.autocontrast(seal.convert("L"))
tinted = ImageOps.colorize(gray, black="#3a1f0c", mid="#8a5424", white="#e2b173").convert("RGBA")
tinted.putalpha(seal.getchannel("A"))
tinted.save(OUT / "seal.webp", quality=86, method=6)

grain = ImageOps.autocontrast(Image.effect_noise((160, 160), 60)).point(lambda v: 238 + v * 17 // 255)
grain.save(OUT / "grain.webp", lossless=True)

qr = qrcode.QRCode(border=1, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data("CONTOH QRIS UNDANGAN SOWANAN. Bukan untuk pembayaran.")
qr.make_image(fill_color="#1C1916", back_color="#F6EEE3").convert("RGB").save(OUT / "qris.png", optimize=True)

subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", str(next(RAW.glob("*.mp3"))),
    "-ac", "2", "-b:a", "96k", "-af", "afade=t=out:st=154:d=4", str(OUT / "music.mp3"),
], check=True)

video = next(RAW.glob("*.mp4"))
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", str(video), "-an",
    "-vf", "crop=810:1080:555:0,scale=540:720", "-c:v", "libx264", "-profile:v", "main",
    "-crf", "28", "-preset", "slow", "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(OUT / "rings.mp4"),
], check=True)
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-ss", "4.5", "-i", str(video),
    "-vf", "crop=810:1080:555:0,scale=540:720", "-frames:v", "1", "-q:v", "4", str(OUT / "rings-poster.jpg"),
], check=True)

for name, (w, h) in sizes.items():
    print(f"{name:12} {w}x{h}")
for f in sorted(OUT.iterdir()):
    print(f"{f.name:18} {f.stat().st_size // 1024} KB")
