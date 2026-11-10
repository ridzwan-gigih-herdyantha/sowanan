import { behindArch, type Point } from "./world";

export const TOWN_LIFE_SRC = "/img/dimas-salsa/town-life.png";

// Kanvas dua kali resolusi peta, jadi gumpalan daun bisa bergeser setengah piksel dan geraknya terasa halus.
const SCALE = 2;
// Seluruh peta cukup 7 kali per detik karena tanaman bergeser sangat pelan, 14 kali saat karakter berjalan supaya urutan
// lapisannya tepat waktu. Air mancur bergerak lebih cepat, jadi kotaknya sendiri digambar 12 kali per detik.
const FULL_IDLE = 1000 / 7;
const FULL_WALK = 1000 / 14;
const WATER_TICK = 1000 / 12;
const MARGIN = 20;
const TAU = Math.PI * 2;
const half = (v: number) => Math.round(v * 2) / 2;
const frameOf = (frames: number[], fps: number, t: number) => frames[Math.floor(t * fps) % frames.length];

// Angin datang dan pergi, jadi tanaman tidak berayun dengan kekuatan yang sama terus-menerus.
const gust = (t: number) => 0.62 + 0.38 * Math.sin(t * 0.23) * Math.sin(t * 0.09 + 1);

// Menggambar lapisan hidup peta: tanaman bergoyang, air mancur, benda berdiri, dan kelopak jatuh. Loop berhenti sendiri
// setelah undangan terbuka. repaint dipanggil di frame yang sama saat urutan karakter dan gerbang berubah, supaya kanvas
// tidak tertinggal dan benda di dekat gerbang tidak berkedip.
function runTownLife(data: typeof import("./town-life-data"), canvases: HTMLCanvasElement[], hero: () => Point) {
  const { FALLS, FLIES, LIFE_ART, LIFE_H, LIFE_TOP, LIFE_W, OBJECTS, RECTS, WATER_BOX } = data;
  // Urutan lapisan peta, dari belakang ke depan: kanvas 0, yang pertama dari karakter dan gerbang, kanvas 1, yang kedua,
  // kanvas 2. Posisi tiap objek terhadap gerbang tetap, hanya urutannya terhadap karakter yang mengikuti kaki.
  const layerOf = (foot: number, behind: number, heroFoot: number, heroBehindGate: boolean) => {
    if (foot >= LIFE_TOP) return 2;
    if (heroBehindGate) return behind ? (foot <= heroFoot ? 0 : 1) : 2;
    return behind ? 0 : foot <= heroFoot ? 1 : 2;
  };
  const atlas = new Image();
  atlas.src = TOWN_LIFE_SRC;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const first = canvases[0];
  let raf = 0;
  let lastFull = 0;
  let lastWater = 0;
  let lastKey = "";
  let stopped = false;
  let ready = false;
  const scene = { foot: 0, behindGate: false };
  const contexts = canvases.map((c) => {
    c.width = LIFE_W * SCALE;
    c.height = LIFE_H * SCALE;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    }
    return ctx;
  });
  // Bagian peta yang terlihat kamera, ditambah sedikit karena kamera ikut bergerak di antara dua gambar.
  const view = { x0: 0, y0: 0, x1: LIFE_W, y1: LIFE_H };
  const blit = (ctx: CanvasRenderingContext2D, id: number, x: number, y: number) => {
    const [sx, sy, w, h] = RECTS[id];
    if (x > view.x1 || y > view.y1 || x + w < view.x0 || y + h < view.y0) return;
    ctx.drawImage(atlas, sx, sy, w, h, x, y, w, h);
  };

  const camera = () => {
    const box = first.getBoundingClientRect();
    const unit = box.width / LIFE_W;
    return { x0: -box.left / unit - MARGIN, y0: -box.top / unit - MARGIN, x1: (window.innerWidth - box.left) / unit + MARGIN, y1: (window.innerHeight - box.top) / unit + MARGIN };
  };

  // Menggambar ulang satu kotak peta. Tanpa kotak berarti seluruh bagian yang terlihat kamera.
  const draw = (t: number, part?: number[]) => {
    const top = contexts[2];
    if (!top) return;
    // Kotak air mancur memakai urutan gambar penuh terakhir, jadi objek tidak terbelah di dua kanvas.
    if (!part) {
      const p = hero();
      scene.foot = p.y / LIFE_ART;
      scene.behindGate = behindArch(p);
    }
    const { foot, behindGate } = scene;
    Object.assign(view, part ? { x0: part[0], y0: part[1], x1: part[2], y1: part[3] } : camera());
    for (const ctx of contexts) {
      if (!ctx) continue;
      ctx.save();
      if (part) {
        ctx.beginPath();
        ctx.rect(part[0], part[1], part[2] - part[0], part[3] - part[1]);
        ctx.clip();
        ctx.clearRect(part[0], part[1], part[2] - part[0], part[3] - part[1]);
      } else ctx.clearRect(0, 0, LIFE_W, LIFE_H);
    }
    const wind = gust(t);
    for (const [objectFoot, behind, parts] of OBJECTS) {
      const ctx = contexts[layerOf(objectFoot, behind, foot, behindGate)];
      if (!ctx) continue;
      for (const [sprite, x, y, ax, ay, ph, per, fps] of parts) {
        const id = typeof sprite === "number" ? sprite : frameOf(sprite, fps, t);
        if (!ax && !ay) {
          blit(ctx, id, x, y);
          continue;
        }
        const a = (TAU * t) / per + ph;
        blit(ctx, id, x + half(Math.sin(a) * ax * wind), y + half(Math.sin(a * 1.7 + ph) * ay * wind));
      }
    }
    for (const [id, x, y, drop, drift, per, ph] of FALLS) {
      const k = (t / per + ph) % 1;
      // Hanya sebagian waktu sebuah kelopak di udara, sisanya menunggu giliran.
      if (k > 0.4) continue;
      const q = k / 0.4;
      blit(top, id, Math.round(x + drift * q + Math.sin(q * 9 + ph * 6) * 2), Math.round(y + drop * q));
    }
    for (const [frames, y, secs, ph] of FLIES) {
      const k = (t / secs + ph) % 1;
      // Burung hanya melintas di awal lintasan, lalu lama tidak terlihat.
      if (k > 0.5) continue;
      blit(top, frameOf(frames, 5, t), Math.round((k / 0.5) * (LIFE_W + 40) - 20), Math.round(y + Math.sin(k * 40) * 3));
    }
    for (const ctx of contexts) ctx?.restore();
  };

  const loop = (now: number) => {
    if (stopped) return;
    if (first.closest('[data-inv-state="open"]')) return;
    raf = requestAnimationFrame(loop);
    // Pratinjau admin menyembunyikan pembuka, tidak perlu menggambar yang tak terlihat.
    if (!first.getClientRects().length) return;
    const p = hero();
    const key = `${p.x},${p.y}`;
    const walking = key !== lastKey;
    if (still) {
      if (!walking) return;
      lastKey = key;
      return draw(0);
    }
    if (now - lastFull >= (walking ? FULL_WALK : FULL_IDLE)) {
      lastFull = lastWater = now;
      lastKey = key;
      return draw(now / 1000);
    }
    if (now - lastWater < WATER_TICK) return;
    lastWater = now;
    const seen = camera();
    if (WATER_BOX[2] > seen.x0 && WATER_BOX[0] < seen.x1 && WATER_BOX[3] > seen.y0 && WATER_BOX[1] < seen.y1) draw(now / 1000, WATER_BOX);
  };
  const begin = () => {
    ready = true;
    if (!stopped) raf = requestAnimationFrame(loop);
  };
  if (atlas.complete && atlas.naturalWidth) begin();
  else atlas.addEventListener("load", begin, { once: true });

  return {
    repaint() {
      if (!ready || stopped) return;
      const now = performance.now();
      lastFull = lastWater = now;
      draw(still ? 0 : now / 1000);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      atlas.removeEventListener("load", begin);
    },
  };
}

// Data potongan cukup besar dan shell memuat komponen ini untuk semua tema, jadi baru diunduh saat pembuka ini tampil.
export function startTownLife(canvases: HTMLCanvasElement[], hero: () => Point) {
  let life: ReturnType<typeof runTownLife> | null = null;
  let stopped = false;
  void import("./town-life-data").then((data) => {
    if (!stopped) life = runTownLife(data, canvases, hero);
  });
  return {
    repaint: () => life?.repaint(),
    stop() {
      stopped = true;
      life?.stop();
    },
  };
}
