import type { StoryData, StoryPhoto } from "@/lib/invitation/story";
import { contrast, isHex, mix } from "./palette";

// Alat gambar untuk template story. Setiap tema menyusun tiga template dari alat ini di src/themes/<tema>/story.ts,
// jadi logika foto, teks, dan warna cukup ditulis sekali. Latar boleh sampai tepi, tetapi teks harus di dalam area
// aman, y 250 sampai 1670, supaya tidak tertutup nama akun dan kolom balas di story.
export const W = 1080;
export const H = 1920;
export const CX = W / 2;
// Watermark di semua template, digambar setelah template selesai. Template jangan menaruh teks di atas y 250.
export const WATERMARK = "sowanan.com";
export const WATERMARK_Y = 230;

export type StoryTemplate = { id: string; name: string; draw: (k: Kit) => void };
// assets berisi gambar tema yang harus dimuat sebelum template digambar.
export type ThemeStory = { assets?: (d: StoryData) => string[]; templates: [StoryTemplate, StoryTemplate, StoryTemplate] };

export type FontKey = "display" | "body" | "name" | "arab" | "jawa" | "label" | "type";
export type Box = { x: number; y: number; w: number; h: number };
type Shadow = { color: string; blur?: number; x?: number; y?: number };

export type TextOpts = {
  font?: FontKey;
  size: number;
  color?: string;
  weight?: number;
  italic?: boolean;
  spacing?: number;
  align?: CanvasTextAlign;
  alpha?: number;
  maxW?: number;
  upper?: boolean;
  stroke?: { color: string; width: number };
  shadow?: Shadow;
  rtl?: boolean;
};

export type ArtOpts = { h?: number; rot?: number; flipX?: boolean; flipY?: boolean; alpha?: number; tint?: string; mode?: GlobalCompositeOperation; shadow?: Shadow; crisp?: boolean };
export type PhotoTone = "mono" | "sepia";
export type PhotoOpts = { path?: Path2D; tone?: PhotoTone; toneColor?: string; pixel?: number; blur?: number; rot?: number; empty?: string; emptyInk?: string };

export type CoupleOpts = Omit<TextOpts, "maxW" | "size"> & {
  x?: number;
  top?: number;
  center?: number;
  bottom?: number;
  size: number;
  maxW?: number;
  // Tinggi terbesar blok nama, untuk template yang punya isi tetap di bawahnya.
  maxH?: number;
  lineHeight?: number;
  // Tinggi baris tanda & terhadap tinggi nama.
  ampGap?: number;
  amp?: Partial<TextOpts> & { scale?: number };
};

const RGB_HEX = /^#[0-9a-f]{6}$/i;
// Canvas tidak punya pengaturan ligatur, tapi browser melewati ligatur pada teks yang punya jarak huruf.
const NO_LIGATURES = 0.01;
const MIN_TEXT = 12;

// Warna terbaca di atas latar: warna pilihan kalau cukup kontras, kalau tidak yang paling kontras dari cadangannya.
export function readable(fg: string, bg: string, min = 3, ...fallback: string[]) {
  if (!RGB_HEX.test(fg) || !RGB_HEX.test(bg) || contrast(fg, bg) >= min) return fg;
  const options = [...fallback, "#FFFFFF", "#111111"].filter((c) => RGB_HEX.test(c));
  return options.find((c) => contrast(c, bg) >= Math.max(min, 3)) ?? options.sort((a, b) => contrast(b, bg) - contrast(a, bg))[0];
}

export const alpha = (hex: string, a: number) => (RGB_HEX.test(hex) ? `${hex}${Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, "0")}` : hex);

// Angka acak yang selalu sama per benih, supaya bintang tidak berpindah saat gambar digambar ulang.
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const archPath = ({ x, y, w, h }: Box) => {
  const p = new Path2D();
  const r = w / 2;
  p.moveTo(x, y + h);
  p.lineTo(x, y + r);
  p.arc(x + r, y + r, r, Math.PI, 0);
  p.lineTo(x + w, y + h);
  p.closePath();
  return p;
};

export const circlePath = (cx: number, cy: number, r: number) => {
  const p = new Path2D();
  p.arc(cx, cy, r, 0, Math.PI * 2);
  return p;
};

export const roundPath = ({ x, y, w, h }: Box, r: number) => {
  const p = new Path2D();
  p.roundRect(x, y, w, h, r);
  return p;
};

export const rectPath = ({ x, y, w, h }: Box) => {
  const p = new Path2D();
  p.rect(x, y, w, h);
  return p;
};

// Bintang atau stiker bergerigi dengan jumlah gerigi tertentu.
export const burstPath = (cx: number, cy: number, r: number, inner: number, points: number, turn = 0) => {
  const p = new Path2D();
  for (let i = 0; i < points * 2; i += 1) {
    const a = turn + (Math.PI * i) / points - Math.PI / 2;
    const d = i % 2 ? inner : r;
    if (i) p.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
    else p.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
  }
  p.closePath();
  return p;
};

export const diamondPath = (x: number, y: number, r: number) => burstPath(x, y, r, r, 2);

export const heartPath = (cx: number, cy: number, s: number) => {
  const p = new Path2D();
  p.moveTo(cx, cy + s * 0.9);
  p.bezierCurveTo(cx - s * 1.3, cy + s * 0.1, cx - s * 0.9, cy - s * 0.95, cx, cy - s * 0.3);
  p.bezierCurveTo(cx + s * 0.9, cy - s * 0.95, cx + s * 1.3, cy + s * 0.1, cx, cy + s * 0.9);
  p.closePath();
  return p;
};

export function createKit(ctx: CanvasRenderingContext2D, d: StoryData, images: Map<string, HTMLImageElement>, onFont?: (font: string, text: string) => void) {
  const c = {
    paper: d.colors.paper,
    ink: d.colors.ink,
    accent: d.colors.accent,
    gold: d.colors.gold,
    night: d.colors.night,
    wash: d.colors.wash,
    card: d.colors.card,
    goldLight: d.colors.goldLight,
    line: d.colors.line,
  };
  const v = (name: `--${string}`, fallback: string) => {
    const value = d.palette[name];
    return value && isHex(value) ? value : fallback;
  };

  const stackOf = (font: FontKey) => d.fonts[font] || d.fonts.body;
  // Font nama pilihan add-on biasanya huruf sambung, yang putus kalau dimiringkan atau diberi jarak.
  const applyFont = (o: TextOpts, size: number) => {
    const key = o.font ?? "body";
    const chosen = key === "name" && d.fonts.customName;
    ctx.font = `${o.italic && !chosen ? "italic " : ""}${o.weight && !chosen ? o.weight : 400} ${size}px ${stackOf(key)}`;
    const plain = (key === "name" && d.fonts.plainName) || (key === "display" && d.fonts.plainDisplay);
    const spacing = chosen || o.rtl ? 0 : (o.spacing ?? 0);
    ctx.letterSpacing = `${spacing || (plain ? NO_LIGATURES : 0)}px`;
  };

  const measure = (s: string, o: TextOpts, size: number) => {
    applyFont(o, size);
    return ctx.measureText(s).width;
  };

  // Teks mengecil sampai muat, supaya nama dan lokasi yang panjang tidak pernah terpotong di tepi gambar.
  const fitSize = (s: string, o: TextOpts) => {
    if (!o.maxW) return o.size;
    let size = o.size;
    while (size > MIN_TEXT && measure(s, o, size) > o.maxW) size -= 1;
    return size;
  };

  const text = (raw: string, x: number, y: number, o: TextOpts) => {
    const s = o.upper ? raw.toLocaleUpperCase("id-ID") : raw;
    if (!s) return o.size;
    const size = fitSize(s, o);
    ctx.save();
    applyFont(o, size);
    onFont?.(ctx.font, s);
    ctx.textAlign = o.align ?? "center";
    ctx.textBaseline = "alphabetic";
    ctx.direction = o.rtl ? "rtl" : "ltr";
    ctx.globalAlpha *= o.alpha ?? 1;
    if (o.shadow) {
      ctx.shadowColor = o.shadow.color;
      ctx.shadowBlur = o.shadow.blur ?? 0;
      ctx.shadowOffsetX = o.shadow.x ?? 0;
      ctx.shadowOffsetY = o.shadow.y ?? 0;
    }
    if (o.stroke) {
      ctx.lineJoin = "round";
      ctx.lineWidth = o.stroke.width;
      ctx.strokeStyle = o.stroke.color;
      ctx.strokeText(s, x, y);
    }
    ctx.fillStyle = o.color ?? c.ink;
    ctx.fillText(s, x, y);
    ctx.restore();
    return size;
  };

  const wrap = (raw: string, o: TextOpts, maxW: number, maxLines = 2) => {
    const s = o.upper ? raw.toLocaleUpperCase("id-ID") : raw;
    const rows: string[] = [];
    let row = "";
    for (const word of s.split(/\s+/).filter(Boolean)) {
      const next = row ? `${row} ${word}` : word;
      if (row && rows.length < maxLines - 1 && measure(next, o, o.size) > maxW) {
        rows.push(row);
        row = word;
      } else row = next;
    }
    return row ? [...rows, row] : rows;
  };

  // Teks yang bisa turun baris. Mengembalikan y baris berikutnya, jadi blok berikutnya tidak menimpa.
  const para = (raw: string, x: number, y: number, o: TextOpts & { lineHeight?: number; maxLines?: number; width: number }) => {
    const rows = wrap(raw, { ...o, upper: false }, o.width, o.maxLines ?? 2);
    const size = Math.min(...rows.map((r) => fitSize(o.upper ? r.toLocaleUpperCase("id-ID") : r, { ...o, maxW: o.width })));
    rows.forEach((r, i) => text(r, x, y + i * size * (o.lineHeight ?? 1.32), { ...o, size, maxW: undefined }));
    return y + rows.length * size * (o.lineHeight ?? 1.32);
  };

  // Nama panjang dibagi dua baris, lalu ukurannya disamakan supaya kedua nama seimbang.
  const coupleLayout = (o: CoupleOpts) => {
    const maxW = o.maxW ?? 820;
    const base = { ...o, maxW: undefined };
    const groom = wrap(d.groom, base, maxW);
    const bride = wrap(d.bride, base, maxW);
    const fitted = Math.min(...[...groom, ...bride].map((row) => fitSize(o.upper ? row.toLocaleUpperCase("id-ID") : row, { ...base, maxW })));
    const heightAt = (s: number) => (groom.length + bride.length) * s * (o.lineHeight ?? 1.08) + s * (o.ampGap ?? 0.82);
    const size = o.maxH && heightAt(fitted) > o.maxH ? Math.floor((fitted * o.maxH) / heightAt(fitted)) : fitted;
    return { groom, bride, size, line: size * (o.lineHeight ?? 1.08), amp: size * (o.ampGap ?? 0.82), height: heightAt(size) };
  };

  // Mengembalikan batas atas dan bawah blok nama, supaya isi lain bisa disusun mengikuti tingginya.
  const couple = (o: CoupleOpts) => {
    const { groom, bride, size, line, amp, height } = coupleLayout(o);
    const start = o.top ?? (o.center !== undefined ? o.center - height / 2 : (o.bottom ?? 0) - height);
    const x = o.x ?? CX;
    const row = (s: string, y: number) => text(s, x, y, { ...o, size, maxW: undefined });
    let y = start;
    for (const s of groom) {
      row(s, y + line * 0.8);
      y += line;
    }
    const a = o.amp ?? {};
    text("&", x, y + amp * 0.72, { font: "display", color: o.color, align: o.align, ...a, size: Math.round(size * (a.scale ?? 0.5)) });
    y += amp;
    for (const s of bride) {
      row(s, y + line * 0.8);
      y += line;
    }
    return { top: start, bottom: y, size };
  };

  const rect = (x: number, y: number, w: number, h: number, fill: string | CanvasGradient, a = 1) => {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  };

  const bg = (fill: string | CanvasGradient) => rect(0, 0, W, H, fill);

  const linear = (x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([at, color]) => g.addColorStop(at, color));
    return g;
  };

  const radial = (x: number, y: number, r0: number, r1: number, stops: [number, string][]) => {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([at, color]) => g.addColorStop(at, color));
    return g;
  };

  const fillPath = (p: Path2D, fill: string | CanvasGradient, shadow?: Shadow) => {
    ctx.save();
    if (shadow) {
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur ?? 0;
      ctx.shadowOffsetX = shadow.x ?? 0;
      ctx.shadowOffsetY = shadow.y ?? 0;
    }
    ctx.fillStyle = fill;
    ctx.fill(p);
    ctx.restore();
  };

  const strokePath = (p: Path2D, color: string, width: number, a = 1, dash?: number[]) => {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.stroke(p);
    ctx.restore();
  };

  const line = (x0: number, y0: number, x1: number, y1: number, color: string, width = 2, a = 1, dash?: number[]) => {
    const p = new Path2D();
    p.moveTo(x0, y0);
    p.lineTo(x1, y1);
    strokePath(p, color, width, a, dash);
  };

  // Garis pemisah dengan titik wajik di tengah, ciri bersama tema formal.
  const rule = (y: number, color: string, half = 170, gap = 26, x = CX) => {
    line(x - half, y, x - gap, y, color);
    line(x + gap, y, x + half, y, color);
    fillPath(diamondPath(x, y, 9), color);
  };

  const groupWith = (fn: () => void, o: { rot?: number; at?: [number, number]; alpha?: number; flipX?: boolean; flipY?: boolean; mode?: GlobalCompositeOperation; shadow?: Shadow }) => {
    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    if (o.mode) ctx.globalCompositeOperation = o.mode;
    if (o.shadow) {
      ctx.shadowColor = o.shadow.color;
      ctx.shadowBlur = o.shadow.blur ?? 0;
      ctx.shadowOffsetX = o.shadow.x ?? 0;
      ctx.shadowOffsetY = o.shadow.y ?? 0;
    }
    if (o.at) ctx.translate(o.at[0], o.at[1]);
    if (o.rot) ctx.rotate(o.rot);
    if (o.flipX || o.flipY) ctx.scale(o.flipX ? -1 : 1, o.flipY ? -1 : 1);
    if (o.at) ctx.translate(-o.at[0], -o.at[1]);
    fn();
    ctx.restore();
  };

  const tinted = new Map<string, HTMLCanvasElement>();
  // Ornamen hitam mengikuti warna palet lewat tint, sama seperti mask di halaman undangan.
  const tintOf = (img: HTMLImageElement, color: string, w: number, h: number) => {
    const key = `${img.src}|${color}|${w}|${h}`;
    let out = tinted.get(key);
    if (!out) {
      out = document.createElement("canvas");
      out.width = Math.max(1, Math.round(w));
      out.height = Math.max(1, Math.round(h));
      const x = out.getContext("2d")!;
      x.drawImage(img, 0, 0, out.width, out.height);
      x.globalCompositeOperation = "source-in";
      x.fillStyle = color;
      x.fillRect(0, 0, out.width, out.height);
      tinted.set(key, out);
    }
    return out;
  };

  const ratio = (img: HTMLImageElement) => (img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1);

  // Gambar aset tema. x dan y adalah tengah gambar supaya rotasi dan cermin tidak menggeser posisinya.
  const art = (src: string, x: number, y: number, w: number, o: ArtOpts = {}) => {
    const img = images.get(src);
    if (!img) return 0;
    const h = o.h ?? w * ratio(img);
    ctx.save();
    ctx.globalAlpha *= o.alpha ?? 1;
    if (o.mode) ctx.globalCompositeOperation = o.mode;
    if (o.shadow) {
      ctx.shadowColor = o.shadow.color;
      ctx.shadowBlur = o.shadow.blur ?? 0;
      ctx.shadowOffsetX = o.shadow.x ?? 0;
      ctx.shadowOffsetY = o.shadow.y ?? 0;
    }
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.flipX ? -1 : 1, o.flipY ? -1 : 1);
    if (o.crisp) ctx.imageSmoothingEnabled = false;
    ctx.drawImage(o.tint ? tintOf(img, o.tint, w, h) : img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return h;
  };

  const tile = (src: string, size: number, a = 1, box: Box = { x: 0, y: 0, w: W, h: H }, mode?: GlobalCompositeOperation, tint?: string) => {
    const img = images.get(src);
    if (!img) return;
    const h = size * ratio(img);
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    ctx.globalAlpha *= a;
    if (mode) ctx.globalCompositeOperation = mode;
    const source = tint ? tintOf(img, tint, size, h) : img;
    for (let y = box.y; y < box.y + box.h; y += h) for (let x = box.x; x < box.x + box.w; x += size) ctx.drawImage(source, x, y, size, h);
    ctx.restore();
  };

  const grain = (src: string, a = 0.35) => tile(src, 600, a, undefined, "multiply");

  const pixelated = new Map<string, HTMLCanvasElement>();
  const pixelOf = (img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, cols: number) => {
    const key = `${img.src}|${sx}|${sy}|${sw}|${sh}|${cols}`;
    let out = pixelated.get(key);
    if (!out) {
      out = document.createElement("canvas");
      out.width = cols;
      out.height = Math.max(1, Math.round((cols * sh) / sw));
      out.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, out.width, out.height);
      pixelated.set(key, out);
    }
    return out;
  };

  // Foto mengisi kotak mengikuti titik fokus dan zoom dari editor. Tanpa foto, kotak menampilkan monogram seperti
  // tempat foto kosong di undangan, karena undangan boleh tidak memakai foto.
  const photo = (p: StoryPhoto | null | undefined, box: Box, o: PhotoOpts = {}) => {
    const path = o.path ?? rectPath(box);
    const img = p ? images.get(p.src) : undefined;
    ctx.save();
    if (o.rot) {
      ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
      ctx.rotate(o.rot);
      ctx.translate(-box.x - box.w / 2, -box.y - box.h / 2);
    }
    ctx.clip(path);
    if (!img || !p) {
      const paint = o.empty ?? c.wash;
      ctx.fillStyle = paint;
      ctx.fillRect(box.x, box.y, box.w, box.h);
      const ink = o.emptyInk ?? readable(c.gold, paint, 2, c.ink);
      text(d.monogram, box.x + box.w / 2, box.y + box.h / 2 + Math.min(box.w, box.h) * 0.06, { font: "display", size: Math.round(Math.min(box.w, box.h) * 0.2), color: ink, maxW: box.w * 0.8 });
      ctx.restore();
      return;
    }
    const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * p.z;
    const sw = box.w / scale;
    const sh = box.h / scale;
    const sx = (img.naturalWidth - sw) * (p.x / 100);
    const sy = (img.naturalHeight - sh) * (p.y / 100);
    // pixel memperbesar foto kecil dengan tepi tajam, blur memperbesarnya dengan halus.
    if (o.pixel || o.blur) {
      ctx.imageSmoothingEnabled = !o.pixel;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(pixelOf(img, sx, sy, sw, sh, (o.pixel || o.blur)!), box.x, box.y, box.w, box.h);
    } else ctx.drawImage(img, sx, sy, sw, sh, box.x, box.y, box.w, box.h);
    // Komposit warna dipakai karena ctx.filter belum tersedia di semua browser HP.
    if (o.tone) {
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "#808080";
      ctx.fillRect(box.x, box.y, box.w, box.h);
      if (o.tone === "sepia") {
        ctx.globalCompositeOperation = "color";
        ctx.fillStyle = o.toneColor ?? "#A5835C";
        ctx.fillRect(box.x, box.y, box.w, box.h);
      }
    }
    ctx.restore();
  };

  // Sprite piksel dari baris huruf, satu huruf satu piksel, titik berarti kosong. Warna boleh berupa var(--nama).
  const sprite = (rows: readonly string[], x: number, y: number, scale: number, colors: Record<string, string>) => {
    const fill = (ch: string) => {
      const value = colors[ch];
      const name = value?.match(/^var((--[^)]+))$/)?.[1];
      return name ? d.palette[name] ?? c.accent : value;
    };
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const color = ch === "." || ch === " " ? undefined : fill(ch);
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(x + i * scale, y + j * scale, scale + 0.5, scale + 0.5);
      });
    });
  };

  // Alamat link di dasar area aman: label kecil lalu kapsul berisi alamat. Warnanya dipilih yang paling terbaca.
  const link = (o: { y?: number; fill: string; ink?: string; label?: string; labelColor?: string; radius?: number; stroke?: string; font?: FontKey; shadow?: Shadow; h?: number; x?: number; spacing?: number; size?: number; upper?: boolean }) => {
    const y = o.y ?? 1560;
    const x = o.x ?? CX;
    const h = o.h ?? 84;
    const font = o.font ?? "body";
    const size = fitSize(d.link, { font, size: o.size ?? 36, maxW: 760, spacing: o.spacing });
    const width = Math.min(measure(d.link, { font, size, spacing: o.spacing }, size) + 92, 860);
    const box = { x: x - width / 2, y, w: width, h };
    const p = roundPath(box, o.radius ?? h / 2);
    fillPath(p, o.fill, o.shadow);
    if (o.stroke) strokePath(p, o.stroke, 3);
    const ink = o.ink ?? readable(c.paper, o.fill, 4.5, c.ink);
    text(d.link, x, y + h / 2 + size * 0.34, { font, size, color: ink, spacing: o.spacing });
    if (o.label !== "") text(o.label ?? "Buka undangan di", x, y - 26, { size: 28, color: o.labelColor ?? c.ink, alpha: 0.8 });
    return box;
  };

  // Watermark kecil di tengah atas, tepat di atas area aman. Bagian tengah biasanya kosong karena nama akun story ada
  // di kiri dan tombol di kanan. Warnanya mengikuti terang latar yang sudah tergambar di bawahnya.
  const watermark = () => {
    const y = WATERMARK_Y;
    let dark = false;
    try {
      const px = ctx.getImageData(CX - 160, y - 26, 320, 32).data;
      let sum = 0;
      for (let i = 0; i < px.length; i += 4) sum += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      dark = sum / (px.length / 4) > 150;
    } catch {
      // Kanvas tercemar gambar lintas asal: pakai teks putih berbayang yang terbaca di hampir semua latar.
    }
    text(WATERMARK, CX, y, {
      size: 24,
      weight: 600,
      spacing: 3,
      color: dark ? "#1A1A1A" : "#FFFFFF",
      alpha: 0.72,
      shadow: { color: dark ? "#FFFFFF66" : "#00000088", blur: 8 },
    });
  };

  return { ctx, d, c, v, text, para, wrap, couple, rect, bg, linear, radial, fillPath, strokePath, line, rule, group: groupWith, art, tile, grain, photo, sprite, link, watermark, fit: fitSize, mix, readable, alpha, measure };
}

export type Kit = ReturnType<typeof createKit>;
