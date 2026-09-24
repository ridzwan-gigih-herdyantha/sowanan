"""Olah aset mentah undangan contoh bagas-sekar ke public/img/bagas-sekar.

python scripts/prepare-bagas-sekar.py "D:/Projects/Work/Assets/sowanan"
"""

import subprocess
import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageOps

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "D:/Projects/Work/Assets/sowanan")
RAW = SRC / "bagas-sekar"
OUT = Path(__file__).resolve().parent.parent / "public/img/bagas-sekar"
OUT.mkdir(parents=True, exist_ok=True)

P = {n: RAW / f"pexels-kalamata-creative-2153072762-{i}.jpg" for n, i in {
    1: 32541739, 2: 32541740, 3: 32541741, 4: 32541742, 5: 32541743,
    6: 32541744, 7: 32541746, 8: 32541747, 9: 32541748, 10: 32541749,
}.items()}

# nama: (foto, kotak crop relatif x0 y0 x1 y1, lebar maksimal)
CROPS = {
    "hero": (2, (0, 0.02, 1, 0.98), 1200),
    "hero-wide": (1, (0, 0, 1, 1), 1800),
    "detail": (3, (0, 0.36, 0.34, 0.7), 700),
    "couple-1": (3, (0, 0.1, 1, 0.9), 1000),
    "couple-2": (8, (0, 0.1, 1, 0.9), 1000),
    "couple-3": (9, (0, 0.1, 1, 0.9), 1000),
    "story-1": (4, (0.233, 0, 0.767, 1), 1200),
    "story-2": (5, (0, 0.05, 1, 0.883), 1200),
    "story-4": (2, (0.1, 0.4, 0.7, 0.85), 1200),
    "venue": (10, (0, 0.08, 1, 0.92), 1000),
    "rsvp": (9, (0, 0.42, 1, 0.865), 1600),
    "g-1": (6, (0, 0.1, 1, 0.95), 1200),
    "g-2": (7, (0, 0, 1, 1), 1400),
    "g-3": (1, (0.25, 0.08, 0.8, 0.75), 1200),
    "g-4": (4, (0.15, 0.1, 0.85, 0.95), 1200),
    "g-5": (10, (0.25, 0.35, 0.85, 0.95), 1200),
    "g-6": (3, (0.1, 0.2, 0.9, 0.65), 1200),
}


def mono(im):
    gray = ImageOps.autocontrast(im.convert("L"), cutoff=0.5)
    return ImageOps.colorize(gray, black="#101010", white="#f3f0eb")


def crop(n, box, width):
    im = ImageOps.exif_transpose(Image.open(P[n])).convert("RGB")
    w, h = im.size
    im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    return mono(im)


sizes = {}
for name, (n, box, width) in CROPS.items():
    im = crop(n, box, width)
    im.save(OUT / f"{name}.jpg", quality=84, optimize=True, progressive=True)
    sizes[name] = im.size

og = crop(1, (0, 0, 1, 1), 1600)
og = og.crop((0, round(og.height * 0.04), og.width, round(og.height * 0.04) + round(og.width * 630 / 1200)))
og.resize((1200, 630), Image.LANCZOS).save(OUT / "og.jpg", quality=82, optimize=True, progressive=True)

grain = ImageOps.autocontrast(Image.effect_noise((160, 160), 60)).point(lambda v: 243 + v * 12 // 255)
grain.save(OUT / "grain.webp", lossless=True)

qr = qrcode.QRCode(border=1, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data("CONTOH QRIS UNDANGAN SOWANAN. Bukan untuk pembayaran.")
qr.make_image(fill_color="#121212", back_color="#E8E5E0").convert("RGB").save(OUT / "qris.png", optimize=True)

video = next(RAW.glob("*.mp4"))
vf = "crop=1080:1440:0:240,scale=540:720,hue=s=0,eq=contrast=1.08"
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", str(video), "-an", "-r", "30", "-vf", vf,
    "-c:v", "libx264", "-profile:v", "main", "-crf", "28", "-preset", "slow",
    "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(OUT / "rings.mp4"),
], check=True)
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-ss", "3", "-i", str(video), "-vf", vf, "-frames:v", "1", "-q:v", "4",
    str(OUT / "rings-poster.jpg"),
], check=True)

music = next(RAW.glob("*.mp3"), None)
if music:
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(music), "-ac", "2", "-b:a", "96k", "-af", "afade=t=out:st=168:d=5", str(OUT / "music.mp3"),
    ], check=True)

for name, (w, h) in sizes.items():
    print(f"{name:12} {w}x{h}")
for f in sorted(OUT.iterdir()):
    print(f"{f.name:18} {f.stat().st_size // 1024} KB")
