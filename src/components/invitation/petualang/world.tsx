"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ARCH,
  ARCH_COLORS,
  artSize,
  BRICK,
  BRICK_COLORS,
  BRIDE_IDLE,
  BRIDE_STEP_A,
  BRIDE_STEP_B,
  BRIDE_WAVE,
  CASTLE,
  CASTLE_COLORS,
  CASTLE_DOOR,
  CASTLE_H,
  CASTLE_TOP,
  CASTLE_W,
  CHARACTER_COLORS,
  COIN,
  COIN_COLORS,
  CRATE,
  CRATE_COLORS,
  DOOR_OPEN,
  FLAG,
  FLAG_COLORS,
  GROOM_IDLE,
  GROOM_JUMP,
  GROOM_KNEEL,
  GROOM_RUN_A,
  GROOM_RUN_B,
  GROOM_RUN_C,
  RING,
  RING_COLORS,
  STONE,
  STONE_COLORS,
} from "./art";
import { chiptune, victory } from "./chiptune";
import { Img, Land, Pixels, useSize, Zoom } from "./land";
import { HEART, Sprite } from "./pixel";

// size menentukan lebar papan: compact untuk cerita, wide untuk galeri dan buku tamu. label diisi untuk papan yang
// muncul di menu peta. story menandai papan cerita, yang di layar tinggi disusun dua lantai.
export type Station = { id: string; node: ReactNode; label?: string; flag?: boolean; story?: boolean; size?: "compact" | "normal" | "wide" };

// Satuan fisika dalam ubin per detik. Lompatan setinggi tiga ubin, cukup untuk dua peti atau pijakan pertama.
const GRAVITY = 70;
const JUMP = Math.sqrt(2 * GRAVITY * 3);
const RUN = 11;
const HUD = 64;
// Tinggi badan karakter dalam ubin.
const BODY = 1.5;
// Jarak bawah papan dari dasar layar, termasuk dua ubin tanah, cukup untuk melompat di bawahnya.
const BOARD_LIFT = 4.4;
// Papan tujuan berada di atas istana.
const GOAL_LIFT = 2 + CASTLE_H + 0.3;
// Tangga batu sepuluh tingkat sebelum garis akhir, seperti tangga di ujung level game lama.
const STAIRS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10];
// Cerita dua lantai, tinggi dalam ubin dari tanah. Semua bata di sini satu arah, jadi jalan di tanah tetap bebas
// bolak-balik. Pijakan pertama yang lebar dicapai dengan satu lompatan, lalu anak tangga melayang cukup dilangkahi
// sampai lantai dua.
const HOP = 2.6;
const HOP_W = 5;
const STEPS = 4;
const RISE = 1.1;
const LEDGE = HOP + STEPS * RISE;
// Papan cerita bawah berdiri sedikit di atas kepala, papan atas berdiri di lantai dua.
const LOW_LIFT = 3.7;
const UPPER_MIN = 5;
// Posisi karakter di layar saat kamera mengikutinya, dihitung dari kiri.
const ANCHOR = 0.32;

// Benda padat dalam ubin, diukur dari permukaan tanah: x kiri, lebar, bawah, dan atas. oneWay hanya bisa dipijak
// dari atas dan bisa ditembus dari bawah atau samping. step adalah anak tangga yang cukup dilangkahi, hop adalah
// pijakan pertama yang dilompati otomatis saat berjalan ke arahnya.
type Solid = { x: number; w: number; y0: number; y1: number; art: "crate" | "stone" | "brick"; oneWay?: boolean; step?: boolean; hop?: boolean };
type Coin = { x: number; y: number };
// Tempat papan: tengah, lebar, jarak bawah dari dasar layar dalam ubin, pijakan tiangnya, jarak atas dari puncak
// layar dalam piksel, dan bendera.
type Spot = { center: number; width: number; lift: number; base: number; top: number; flag?: { x: number; y: number } };
type Phase = "toBride" | "zoomIn" | "kneel" | "yes" | "zoomOut" | "toCastle" | "inside" | "rise" | "party";

const FRAMES = { idle: GROOM_IDLE, a: GROOM_RUN_A, b: GROOM_RUN_B, c: GROOM_RUN_C, jump: GROOM_JUMP, kneel: GROOM_KNEEL } as const;
const STRIDE = ["a", "b", "c", "b"] as const;
const ART = { crate: [CRATE, CRATE_COLORS], stone: [STONE, STONE_COLORS], brick: [BRICK, BRICK_COLORS] } as const;
// Kembang api di atas istana: posisi dalam ubin dari puncak istana, warna, dan jeda mulai.
const BURSTS = [
  { x: -5.5, y: 0.5, c: "#F48FB1", d: 0 },
  { x: 4, y: -0.5, c: "#F6C945", d: 0.7 },
  { x: -1, y: -1.5, c: "#7FD3FF", d: 1.3 },
  { x: 6, y: 1.5, c: "#FFFFFF", d: 1.9 },
  { x: -3, y: -2, c: "#B9F27A", d: 2.4 },
];
// Hati yang melayang di antara kedua mempelai saat lamaran: posisi dalam ubin, jeda mulai, dan ukuran.
const LOVE = [
  { x: -0.9, y: -0.1, d: 0, k: 0.8 },
  { x: -0.3, y: -0.8, d: 0.3, k: 1.1 },
  { x: 0.3, y: -0.3, d: 0.6, k: 0.9 },
  { x: 0.8, y: -1, d: 0.15, k: 0.7 },
  { x: -0.1, y: -1.4, d: 0.9, k: 1.2 },
  { x: 0.6, y: 0.2, d: 1.2, k: 0.8 },
];

function blip(freqs: number[]) {
  if (!chiptune.playing) return;
  chiptune.sfx(freqs);
}

const typing = () => (document.activeElement as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]");

// Dunia Co-op Adventure: seluruh undangan sebagai satu level ke samping. Mempelai pria hanya bergerak dari tombol
// atau keyboard, kamera mengikutinya, dan semua isi undangan berupa papan di sepanjang jalan. Papan yang isinya
// panjang bisa digulir di dalam papannya. Setelah melewati puncak tangga batu terakhir, adegan penutup berjalan
// sendiri: pria menghampiri wanita, kamera mendekat, pria berlutut menyerahkan cincin, kamera menjauh lagi, keduanya
// masuk istana dan muncul di atasnya, lalu jendela penutup terbuka.
// Tanpa JavaScript, panggung bisa digeser ke samping seperti biasa.
// Geser dibulatkan ke piksel layar utuh. Geseran pecahan membuat GPU menghaluskan seni piksel, sehingga tampak
// buram seperti motion blur saat berjalan dan baru tajam lagi ketika berhenti.
function snap(v: number) {
  const d = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return Math.round(v * d) / d;
}

export function World({ start, stations, goal, finale, groom, bride, date }: { start: ReactNode; stations: Station[]; goal: ReactNode; finale: ReactNode; groom: string; bride: string; date: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const heroine = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLSpanElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const coinEls = useRef<(HTMLElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const held = useRef(0);
  const jumpQueued = useRef(false);
  const timers = useRef<number[]>([]);
  // Posisi karakter dalam ubin, bertahan saat ukuran layar berubah.
  const pos = useRef<{ x: number; y: number } | null>(null);
  const warp = useRef<(tiles: number) => void>(() => {});
  const [reached, setReached] = useState(false);
  const [menu, setMenu] = useState(false);
  const [ending, setEnding] = useState(false);
  // locked selama adegan penutup, ended setelah adegan selesai.
  const [locked, setLocked] = useState(false);
  const [ended, setEnded] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  // Mempelai wanita bersorak saat bertemu dan saat muncul di atas istana, tidak sambil berjalan.
  const [cheer, setCheer] = useState(false);
  // Setelah keduanya masuk, istana berada di depan, jadi keduanya tampak berdiri di balik benteng atas.
  const [behind, setBehind] = useState(false);
  // Hati di antara kedua mempelai selama lamaran.
  const [love, setLove] = useState(false);
  // Pintu istana terbuka saat kedua mempelai tiba di depannya dan tertutup lagi setelah keduanya masuk.
  const [door, setDoor] = useState(false);
  const reduce = useReducedMotion();
  const size = useSize(stage);
  const { w: vw, h: vh, t } = size;

  // Susunan level dalam satuan ubin: layar awal, papan berurutan, peti dan koin di antaranya, lalu garis akhir.
  const plan = useMemo(() => {
    // Dibulatkan supaya angka posisi di server dan di peramban persis sama.
    const r = (n: number) => Math.round(n * 100) / 100;
    const cols = vw / t;
    const rows = vh / t;
    const sizes = { compact: r(Math.min(vw * 0.8, 420) / t), normal: r(Math.min(vw * 0.86, 620) / t), wide: r(Math.min(vw * 0.9, 980) / t) };
    const space = Math.max(4, cols * 0.22);
    const twoFloors = rows - HUD / t >= 2 + LEDGE + 2 + UPPER_MIN;

    const spots: Spot[] = [];
    const solids: Solid[] = [];
    const gaps: [number, number][] = [];
    const coins: Coin[] = [];
    let edge = cols;
    let i = 0;
    while (i < stations.length) {
      const st = stations[i];
      const w = sizes[st.size ?? "normal"];
      const before = edge;
      const upper = twoFloors && st.story && stations[i + 1]?.story ? i + 1 : -1;
      if (upper > 0) {
        const c = r(edge + 2 + HOP_W + STEPS + w / 2);
        const left = r(c - w / 2);
        const hop = r(left - STEPS - HOP_W);
        // Papan bawah di antara tanah dan lantai dua, papan atas berdiri di lantai dua.
        spots[i] = { center: c, width: w, lift: LOW_LIFT, base: 2, top: Math.round(vh - (2 + LEDGE - 1.15) * t), flag: st.flag ? { x: r(left + w + 0.6), y: 0 } : undefined };
        spots[upper] = { center: c, width: w, lift: 2 + LEDGE + 2, base: 2 + LEDGE, top: HUD, flag: stations[upper].flag ? { x: r(left + 0.6), y: LEDGE } : undefined };
        // Pijakan pertama, anak tangga melayang, lalu lantai dua di atas papan bawah. Koin di atas anak tangga
        // menunjukkan jalannya.
        solids.push({ x: hop, w: HOP_W, y0: HOP - 1, y1: HOP, art: "brick", oneWay: true, hop: true });
        for (let k = 1; k <= STEPS; k++) {
          const top = r(HOP + k * RISE);
          solids.push({ x: r(left - STEPS + k - 1), w: 1, y0: r(top - 1), y1: top, art: "brick", oneWay: true, step: true });
          coins.push({ x: r(left - STEPS + k - 0.5), y: r(top + 0.6) });
        }
        solids.push({ x: left, w: Math.round(w), y0: r(LEDGE - 1), y1: LEDGE, art: "brick", oneWay: true });
        gaps.push([before, r(hop - 1)]);
        edge = c + w / 2 + 1.5;
        i += 2;
        continue;
      }
      const lead = st.size === "compact" && stations[i - 1]?.size === "compact" ? Math.max(3, space * 0.6) : space;
      const c = r(edge + lead + w / 2);
      const left = r(c - w / 2);
      spots[i] = { center: c, width: w, lift: BOARD_LIFT, base: 2, top: HUD, flag: st.flag ? { x: r(left - 1), y: 0 } : undefined };
      gaps.push([before, left]);
      edge = c + w / 2;
      i++;
    }

    // Layar terakhir, dari kiri: tangga batu, tanah kosong, gapura dengan mempelai wanita, lalu istana.
    // scene adalah lebar susunan dari tepi kiri gapura sampai tepi kanan istana.
    const scene = 5 + CASTLE_W;
    const archAt = Math.max(1.5, (cols - scene) / 2 + 1.5);
    const final = r(edge + space + STAIRS.length + 3 + 1.5 - archAt);
    const arch = r(final + archAt);
    const castle = r(arch + 3.5);
    const goalCenter = r(castle + CASTLE_W / 2);
    const width = r(Math.max(final + cols, castle + CASTLE_W / 2 + cols / 2, castle + CASTLE_W + 0.5));
    const stairs = arch - 1.5 - 3 - STAIRS.length;
    // Tanah sebelum tangga batu dibiarkan kosong tanpa peti.
    STAIRS.forEach((h, k) => solids.push({ x: Math.round(stairs + k), w: 1, y0: 0, y1: h, art: "stone" }));

    // Peti dan koin di tengah setiap jarak kosong yang cukup lebar.
    gaps.forEach(([a, b], k) => {
      if (b - a < 4) return;
      const mid = Math.round((a + b) / 2);
      const h = k % 3 === 1 ? 2 : 1;
      solids.push({ x: mid, w: 1, y0: 0, y1: h, art: "crate" });
      if (k % 2 === 0 && b - a > 8) solids.push({ x: mid + 3, w: 1, y0: 0, y1: 1, art: "crate" });
      for (let j = -1; j <= 1; j++) coins.push({ x: r(mid + 0.5 + j * 1.1), y: r(h + 1.4 - Math.abs(j) * 0.4) });
    });
    return { cols, sizes, spots, solids, coins, goalCenter, arch, castle, stairsStart: Math.round(stairs), stairsEnd: r(Math.round(stairs) + STAIRS.length), width };
  }, [stations, vw, vh, t]);

  const W = plan.width * t;

  useEffect(() => {
    stage.current?.classList.add("pt-live");
  }, []);

  useEffect(() => {
    const me = hero.current;
    const her = heroine.current;
    const box = stage.current;
    if (!me || !her || !box) return;
    box.scrollLeft = 0;
    const T = t;
    const H = BODY * T;
    const flags = Array.from(box.querySelectorAll<HTMLElement>(".pt-flag")).map((f) => ({ el: f, x: Number(f.dataset.x), y: Number(f.dataset.y) }));
    const solids = plan.solids.map((b) => ({ x0: b.x * T, x1: (b.x + b.w) * T, y0: b.y0 * T, y1: b.y1 * T, oneWay: Boolean(b.oneWay), step: Boolean(b.step), hop: Boolean(b.hop) }));
    const coins = plan.coins.map((c, i) => ({ x: c.x * T, y: c.y * T, taken: coinEls.current[i]?.hasAttribute("data-taken") ?? false }));
    const half = 0.38 * T;
    const over = (x: number, s: { x0: number; x1: number }) => x + half > s.x0 && x - half < s.x1;
    // Permukaan tertinggi di bawah kaki: tanah atau atas benda yang tidak lebih tinggi dari kaki.
    const surface = (x: number, y: number) => solids.reduce((m, s) => (over(x, s) && s.y1 <= y + 1 ? Math.max(m, s.y1) : m), 0);
    // Benda padat yang menghalangi badan di posisi x. Platform satu arah tidak pernah menghalangi.
    const blocked = (x: number, y: number) => solids.some((s) => !s.oneWay && over(x, s) && s.y1 > y + 1 && s.y0 < y + H - 2);
    const minX = T * 0.5;
    const door = (plan.castle + CASTLE_W / 2) * T;
    const maxX = door;
    const brideHome = (plan.arch + 0.2) * T;
    const meetX = (plan.arch - 1.1) * T;
    const stairsEnd = plan.stairsEnd * T;
    const camFor = (x: number) => Math.min(W - vw, Math.max(0, x - vw * ANCHOR));
    // Selama adegan penutup kamera berhenti saat istana tepat di tengah layar.
    const castleCam = (plan.castle + CASTLE_W / 2) * T - vw * (0.5 - ANCHOR);

    let x = pos.current === null ? vw * 0.22 : pos.current.x * T;
    let y = pos.current === null ? 0 : surface(x, pos.current.y * T);
    let vx = 0;
    let vy = 0;
    let cam = camFor(x);
    let facing = 1;
    let dist = 0;
    let got = coins.filter((c) => c.taken).length;
    let raf = 0;
    let last = performance.now();
    const shown: Record<string, string> = {};
    // Menulis ke elemen hanya bila nilainya berubah. Mengganti atribut atau variabel di elemen karakter memicu
    // hitung ulang gaya semua kotak pikselnya, jadi penulisan yang sama setiap frame membuat gerak tersendat.
    const write = (key: string, value: string, apply: () => void) => {
      if (shown[key] === value) return;
      shown[key] = value;
      apply();
    };
    // Adegan penutup: fase, waktu mulai fase, serta posisi, arah, dan kejelasan mempelai wanita.
    let cut: { phase: Phase; at: number } | null = null;
    let bx = brideHome;
    let by = 0;
    let bFace = 1;
    let bAlpha = 1;
    let gAlpha = 1;
    let bDist = 0;

    const next = (phase: Phase, now: number) => {
      cut = { phase, at: now };
    };
    const lensTo = (v: string) => write("lens", v, () => lens.current && (lens.current.style.transform = v));
    const reset = () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      cut = null;
      bx = brideHome;
      by = 0;
      bFace = 1;
      bAlpha = 1;
      gAlpha = 1;
      setReached(false);
      setCheer(false);
      setBehind(false);
      setLove(false);
      lensTo("none");
      write("door", "closed", () => setDoor(false));
      setFireworks(false);
      setEnded(false);
      setLocked(false);
      setEnding(false);
    };

    warp.current = (tiles) => {
      reset();
      x = Math.min(maxX, Math.max(minX, tiles * T));
      y = solids.reduce((m, s) => (over(x, s) && s.y0 <= 1 && !s.oneWay ? Math.max(m, s.y1) : m), 0);
      vx = 0;
      vy = 0;
      cam = camFor(x);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const frozen = cut !== null && (cut.phase === "inside" || cut.phase === "rise" || cut.phase === "party");

      if (!frozen) {
        // Selama adegan penutup, langkah diatur adegan dan tombol tidak dibaca.
        let want = cut ? 0 : held.current * RUN * T;
        const walk = RUN * 0.42 * T;
        if (cut?.phase === "toBride") want = Math.abs(meetX - x) > 2 ? Math.sign(meetX - x) * walk : 0;
        if (cut?.phase === "toCastle") want = door - x > 2 ? walk : 0;
        vx += (want - vx) * (1 - Math.exp(-(want ? 10 : 14) * dt));
        if (!want && Math.abs(vx) < T * 0.05) vx = 0;
        const grounded = y <= surface(x, y) + 0.5 && vy <= 0;
        const dir = Math.sign(vx);
        if (Math.abs(vx) > T * 0.5) facing = dir;
        // Anak tangga bata cukup dilangkahi: begitu badan menyentuh anak tangga yang lebih tinggi paling satu ubin,
        // karakter langsung berdiri di atasnya.
        const step = grounded && Math.abs(vx) > T * 0.3 ? solids.find((s) => s.step && over(x, s) && s.y1 > y + 1 && s.y1 <= y + T * 1.15) : undefined;
        if (step) y = step.y1;
        // Peti dan tangga batu di depan dilompati otomatis saat berjalan, jadi tamu tidak tersangkut. Pijakan pertama
        // lantai dua juga, tapi hanya saat berjalan ke kanan dari tanah, jadi jalan kembali ke kiri tetap lurus.
        else if (grounded && Math.abs(vx) > T && solids.some((s) => !s.oneWay && over(x + dir * T * 0.9, s) && s.y0 <= y + 1 && s.y1 > y + 1)) vy = JUMP * T;
        else if (grounded && !cut && dir > 0 && vx > T * 4 && y < 1 && solids.some((s) => s.hop && s.x0 - x >= T * 0.5 && s.x0 - x <= T * 1.5)) vy = JUMP * T;
        if (jumpQueued.current) {
          jumpQueued.current = false;
          if (grounded && !cut) {
            vy = JUMP * T;
            blip([660, 990]);
          }
        }
        const nx = Math.min(maxX, Math.max(minX, x + vx * dt));
        if (!blocked(nx, y)) {
          dist += Math.abs(nx - x);
          x = nx;
        } else vx = 0;

        const prev = y;
        vy -= GRAVITY * T * dt;
        y += vy * dt;
        for (const s of solids) {
          if (!over(x, s)) continue;
          // Mendarat di atas benda, atau kepala terbentur bagian bawah benda padat saat melompat.
          if (vy <= 0 && prev >= s.y1 - 1 && y < s.y1) {
            y = s.y1;
            vy = 0;
          } else if (!s.oneWay && vy > 0 && prev + H <= s.y0 + 1 && y + H > s.y0) {
            y = s.y0 - H;
            vy = 0;
          }
        }
        if (y < 0) {
          y = 0;
          vy = 0;
        }
      } else jumpQueued.current = false;

      // Adegan penutup dimulai begitu melewati ujung tangga batu terakhir.
      if (!cut && x > stairsEnd + T * 0.4) {
        held.current = 0;
        setLocked(true);
        setMenu(false);
        next("toBride", now);
      }
      if (cut) {
        const since = now - cut.at;
        if (cut.phase === "toBride" && Math.abs(meetX - x) <= 2 && y <= 1) {
          // Kamera mendekat ke kedua mempelai. Tepi dunia tetap menutup layar, jadi tanah tidak pernah terpotong.
          setReached(true);
          const k = Math.min(3, Math.max(2, vh / (T * 7)));
          const px = (x + brideHome) / 2 - camFor(Math.min(x, castleCam));
          const py = vh - 2 * T - H * 0.6;
          const tx = Math.min(0, Math.max(vw * (1 - k), vw / 2 - px * k));
          const ty = Math.min(0, Math.max(vh * (1 - k), vh / 2 - py * k));
          lensTo(`translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${k.toFixed(2)})`);
          next("zoomIn", now);
        } else if (cut.phase === "zoomIn") {
          facing = 1;
          if (since > 1000) {
            setLove(true);
            blip([784, 988, 1175, 1568]);
            next("kneel", now);
          }
        } else if (cut.phase === "kneel" && since > 2200) {
          setCheer(true);
          blip([523, 659, 784, 1047]);
          next("yes", now);
        } else if (cut.phase === "yes" && since > 1600) {
          lensTo("none");
          next("zoomOut", now);
        } else if (cut.phase === "zoomOut" && since > 1000) {
          setCheer(false);
          setLove(false);
          next("toCastle", now);
        } else if (cut.phase === "toCastle") {
          // Mempelai wanita mulai mengikuti setelah mempelai pria lewat di depannya.
          const target = door - T * 0.9;
          if (x > bx + T * 0.6 && target - bx > 2) {
            const move = Math.min(target - bx, RUN * 0.38 * T * dt);
            bx += move;
            bDist += move;
            bFace = -1;
          }
          if (door - x < T * 2.5) write("door", "open", () => setDoor(true));
          if (door - x <= 2) gAlpha = Math.max(0, gAlpha - dt / 0.45);
          if (target - bx <= 2) bAlpha = Math.max(0, bAlpha - dt / 0.45);
          if (gAlpha === 0 && bAlpha === 0) {
            setBehind(true);
            write("door", "closed", () => setDoor(false));
            blip([196, 147]);
            next("inside", now);
          }
        } else if (cut.phase === "inside" && since > 800) {
          // Keduanya muncul di jalan atas bangunan tengah istana, saling berhadapan.
          x = (plan.castle + CASTLE_W / 2 - 0.5) * T;
          y = CASTLE_TOP * T;
          facing = 1;
          bx = (plan.castle + CASTLE_W / 2 + 0.5) * T;
          by = CASTLE_TOP * T;
          bFace = 1;
          next("rise", now);
        } else if (cut.phase === "rise") {
          const k = Math.min(1, since / 1400);
          gAlpha = k;
          bAlpha = k;
          if (k === 1) {
            next("party", now);
            setCheer(true);
            victory();
            setFireworks(true);
            timers.current.push(
              window.setTimeout(() => {
                setEnding(true);
                setEnded(true);
                setLocked(false);
              }, 2000),
            );
          }
        }
      }

      pos.current = { x: x / T, y: y / T };
      const under = frozen ? y : surface(x, y);
      const air = !frozen && y > under + 0.5;
      const pose = cut?.phase === "kneel" ? "kneel" : air ? "jump" : !frozen && Math.abs(vx) > T * 0.4 ? STRIDE[Math.floor(dist / (T * 0.42)) % 4] : "idle";
      write("pose", pose, () => (me.dataset.pose = pose));
      me.style.transform = `translate3d(${snap(x - T / 2)}px, ${snap(-y)}px, 0)`;
      write("alpha", gAlpha.toFixed(2), () => (me.style.opacity = gAlpha.toFixed(2)));
      write("face", String(facing), () => me.style.setProperty("--face", String(facing)));
      her.style.transform = `translate3d(${snap(bx - brideHome)}px, ${snap(-by)}px, 0)`;
      write("bAlpha", bAlpha.toFixed(2), () => (her.style.opacity = bAlpha.toFixed(2)));
      write("bFace", String(bFace), () => her.style.setProperty("--face", String(bFace)));
      // Langkah mempelai wanita berganti bingkai selama berjalan, berdiri diam bila tidak.
      const walking = cut?.phase === "toCastle" && bAlpha > 0 && bx < door - T * 0.9 - 2 && x > bx + T * 0.6;
      const herPose = walking ? (Math.floor(bDist / (T * 0.4)) % 2 ? "b" : "a") : "idle";
      write("herPose", herPose, () => (her.dataset.pose = herPose));
      if (shade.current) {
        const lift = Math.min(1, (y - under) / (T * 3));
        shade.current.style.transform = `translate3d(${snap(x - T * 0.42)}px, ${snap(-under)}px, 0) scale(${(1 - lift * 0.55).toFixed(2)})`;
        shade.current.style.opacity = frozen ? "0" : ((0.32 - lift * 0.2) * gAlpha).toFixed(2);
      }

      for (const [i, c] of coins.entries()) {
        if (c.taken || Math.abs(c.x - x) > T * 0.6 || Math.abs(c.y + T * 0.3 - (y + H / 2)) > T * 0.95) continue;
        c.taken = true;
        coinEls.current[i]?.setAttribute("data-taken", "");
        got++;
        if (counter.current) counter.current.textContent = String(got).padStart(2, "0");
        blip([988, 1319]);
      }
      // Bendera di lantai dua hanya menyala bila dilewati dari lantai dua.
      for (const f of flags) if (x >= f.x && y >= f.y - 1) write(`flag-${f.x}-${f.y}`, "1", () => f.el.setAttribute("data-done", ""));

      // Kamera mengejar karakter dengan lerp, jadi geraknya halus walau karakter berhenti mendadak.
      const to = camFor(cut ? Math.min(x, castleCam) : x);
      cam = reduce ? to : cam + (to - cam) * (1 - Math.exp(-8 * dt));
      if (track.current) track.current.style.transform = `translate3d(${snap(-cam)}px, 0, 0)`;
      [0.1, 0.2, 0.45, 1].forEach((f, i) => {
        const l = layers.current[i];
        if (l) l.style.transform = `translate3d(${snap(-cam * f)}px, 0, 0)`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, [plan, t, vw, vh, W, reduce]);

  useEffect(() => {
    if (ending) closeRef.current?.focus();
  }, [ending]);

  // Keyboard: panah atau A dan D untuk berjalan, spasi, panah atas, atau W untuk melompat.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        setMenu(false);
        setEnding(false);
        return;
      }
      if (typing() || document.querySelector('[data-inv-state="closed"]')) return;
      if (e.code === "ArrowRight" || e.code === "KeyD") held.current = 1;
      else if (e.code === "ArrowLeft" || e.code === "KeyA") held.current = -1;
      else if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") jumpQueued.current = true;
      else return;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if ((e.code === "ArrowRight" || e.code === "KeyD") && held.current === 1) held.current = 0;
      if ((e.code === "ArrowLeft" || e.code === "KeyA") && held.current === -1) held.current = 0;
    };
    const blur = () => {
      held.current = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Karakter dipindah ke depan papan yang dituju, sehingga papan itu tampil di tengah layar.
  const front = (center: number) => center - (vw * (0.5 - ANCHOR)) / t;
  const goTo = (center: number) => warp.current(front(center));

  useEffect(() => {
    const el = track.current;
    if (!el || reduce) return;
    const id = window.setInterval(() => el.toggleAttribute("data-spin"), 600);
    return () => window.clearInterval(id);
  }, [reduce]);

  // Editor meminta sebuah foto ditampilkan di pratinjau, jadi karakter dipindah ke papan yang memuat foto itu.
  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const reveal = (e: Event) => {
      e.preventDefault();
      const at = (e.target as HTMLElement).closest<HTMLElement>("[data-at]");
      if (at) warp.current(Number(at.dataset.at) - (vw * (0.5 - ANCHOR)) / t);
    };
    box.addEventListener("sowanan:reveal", reveal);
    return () => box.removeEventListener("sowanan:reveal", reveal);
  }, [vw, t]);

  // Fokus keyboard ke isi papan memindahkan karakter ke papan itu, karena panggung tidak bisa digulir sendiri.
  const onFocus = (e: React.FocusEvent) => {
    if (stage.current) stage.current.scrollLeft = 0;
    if (locked) return;
    const at = (e.target as HTMLElement).closest<HTMLElement>("[data-at]");
    if (at) goTo(Number(at.dataset.at));
  };

  // Tombol arah ditahan untuk berjalan. Arahnya dibaca dari data-dir tombol.
  const press = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    held.current = Number(e.currentTarget.dataset.dir);
  };
  const release = () => {
    held.current = 0;
  };
  const pad = { onPointerDown: press, onPointerUp: release, onPointerCancel: release, onLostPointerCapture: release, disabled: locked };

  const s = t / 16;
  const groundTop = vh - t * 2;
  // --room adalah tinggi yang tersedia untuk foto di papan, supaya isi papan tidak pernah melewati layar.
  const boardStyle = (sp: Spot, extra = 0) =>
    ({ left: sp.center * t, width: sp.width * t, bottom: t * sp.lift, top: sp.top, transform: "translateX(-50%)", "--room": `${Math.max(60, Math.round(vh - sp.top - sp.lift * t - 40 - extra))}px` }) as CSSProperties;
  const archSize = artSize(ARCH);
  const castleSize = artSize(CASTLE);
  const goalSpot: Spot = { center: plan.goalCenter, width: plan.sizes.normal, lift: GOAL_LIFT, base: 2, top: HUD };
  // Tujuan di menu peta. Garis akhir membawa karakter ke tanah tepat sebelum tangga batu, bukan ke atas tangga.
  const places = [
    { label: "Mulai", x: (vw * 0.22) / t },
    ...stations.flatMap((st, i) => (st.label ? [{ label: st.label, x: front(plan.spots[i].center) }] : [])),
    { label: "Garis akhir", x: plan.stairsStart - 1.5 },
  ];

  return (
    <section data-world className="pt-world pt-sky relative h-svh overflow-hidden">
      <div ref={stage} onFocusCapture={onFocus} className="pt-stage relative h-svh overflow-x-auto overflow-y-hidden text-[#FFF6E5]">
        <Zoom size={size}>
          <div className="relative h-full" style={{ "--t": `${t}px` } as CSSProperties}>
            {/* Lensa membungkus seluruh dunia supaya kamera bisa mendekat saat lamaran. Papan status dan tombol di luarnya. */}
            <div ref={lens} className="pt-lens absolute inset-0">
              <Land size={size} width={W} layers={layers} decor />
              <div ref={track} className="pt-track absolute inset-y-0 left-0 will-change-transform" style={{ width: W }}>
                {/* Layar awal: judul dan misi. */}
                <div data-at={plan.cols * 0.5} className="absolute flex flex-col items-center justify-center px-6 text-center" style={{ left: 0, width: vw, top: HUD, bottom: t * 4.2 }}>
                  {start}
                </div>

                {fireworks && (
                  <div aria-hidden="true" className="pointer-events-none absolute" style={{ left: (plan.castle + CASTLE_W / 2) * t, top: groundTop - (CASTLE_H + 1.5) * t }}>
                    {BURSTS.map((b, i) => (
                      <span key={i} className="absolute" style={{ left: b.x * t, top: b.y * t }}>
                        {Array.from({ length: 12 }, (_, k) => (
                          <span key={k} className="pt-spark" style={{ "--a": `${k * 30}deg`, "--c": b.c, "--r": `${t * 1.9}px`, animationDelay: `${b.d}s` } as CSSProperties} />
                        ))}
                      </span>
                    ))}
                  </div>
                )}

                {/* Istana di ujung level, dipasang lebih dulu supaya tampak di belakang kedua mempelai. */}
                <Img art={CASTLE} colors={CASTLE_COLORS} scale={s} className={behind ? "z-20" : ""} style={{ left: plan.castle * t, top: groundTop - castleSize.h * s }} />
                {door && <Img art={DOOR_OPEN} colors={CASTLE_COLORS} scale={s} style={{ left: plan.castle * t + CASTLE_DOOR * s, top: groundTop - artSize(DOOR_OPEN).h * s }} />}

                {stations.map((st, i) => {
                  const sp = plan.spots[i];
                  return (
                    <div key={st.id} data-at={sp.center} className="absolute flex flex-col justify-end" style={boardStyle(sp)}>
                      <div className="pt-post" style={{ left: "18%", height: t * (sp.lift - sp.base) + 2 }} />
                      <div className="pt-post" style={{ right: "18%", height: t * (sp.lift - sp.base) + 2 }} />
                      <div className="relative flex max-h-full min-h-0 flex-col">{st.node}</div>
                    </div>
                  );
                })}
                {plan.spots.map(
                  (sp, i) =>
                    sp.flag && (
                      <span key={`flag-${i}`} className="pt-flag absolute" data-x={Math.round(sp.flag.x * t)} data-y={Math.round(sp.flag.y * t)} style={{ left: sp.flag.x * t - t * 0.4, bottom: t * (2 + sp.flag.y) }}>
                        <Pixels art={FLAG} colors={FLAG_COLORS} scale={Math.max(2, s - 1)} />
                      </span>
                    ),
                )}

                {/* Satu elemen per benda dengan ubin berulang, satu piksel lebih lebar dan lebih tinggi supaya tidak ada
                    celah di antara benda yang bersebelahan saat layar diperkecil. */}
                {plan.solids.map((b, i) => {
                  const rows = Math.max(1, Math.round(b.y1 - b.y0));
                  return (
                    <Img
                      key={i}
                      art={ART[b.art][0]}
                      colors={ART[b.art][1]}
                      scale={s}
                      style={{ left: b.x * t, top: groundTop - b.y1 * t, width: Math.round(b.w) * t + 1, height: rows * t + 1, backgroundSize: `${t}px ${t}px`, backgroundRepeat: "repeat" }}
                    />
                  );
                })}

                {/* Garis akhir: gapura bunga dengan mempelai wanita, lalu istana. */}
                <div data-at={plan.goalCenter} data-reached={reached ? "" : undefined} className="pt-goal absolute flex flex-col justify-end" style={boardStyle(goalSpot, 40)}>
                  <div className="relative flex max-h-full min-h-0 flex-col">{goal}</div>
                </div>
                <Img art={ARCH} colors={ARCH_COLORS} scale={s} style={{ left: plan.arch * t - (archSize.w * s) / 2, top: groundTop - archSize.h * s }} />
                <div ref={heroine} data-pose="idle" className="pt-heroine absolute" style={{ left: (plan.arch + 0.2) * t - t / 2, top: groundTop - t * BODY }}>
                  <span className="pt-face block">
                    <span className={`pt-frames ${cheer ? "pt-cheer" : "pt-bob"}`}>
                      {cheer ? (
                        <Pixels art={BRIDE_WAVE} colors={CHARACTER_COLORS} scale={s} />
                      ) : (
                        <>
                          <Pixels art={BRIDE_IDLE} colors={CHARACTER_COLORS} scale={s} className="pt-pose-idle" />
                          <Pixels art={BRIDE_STEP_A} colors={CHARACTER_COLORS} scale={s} className="pt-pose-a" />
                          <Pixels art={BRIDE_STEP_B} colors={CHARACTER_COLORS} scale={s} className="pt-pose-b" />
                        </>
                      )}
                    </span>
                  </span>
                  {cheer && (
                    <span className="absolute -top-2 left-0 w-full">
                      {[0, 1, 2, 3, 4].map((k) => (
                        <span key={k} className="pt-rise absolute" style={{ left: `${-30 + k * 35}%`, animationDelay: `${k * 0.18}s` }}>
                          <Sprite data={HEART} scale={Math.max(2, Math.round(s * 0.9))} />
                        </span>
                      ))}
                    </span>
                  )}
                </div>

                {love && (
                  <div aria-hidden="true" className="pointer-events-none absolute z-30" style={{ left: (plan.arch - 0.45) * t, top: groundTop - t * (BODY + 0.5) }}>
                    {LOVE.map((h, k) => (
                      <span key={k} className="pt-rise absolute" style={{ left: h.x * t, top: h.y * t, animationDelay: `${h.d}s` }}>
                        <Sprite data={HEART} scale={Math.max(2, Math.round(s * h.k))} />
                      </span>
                    ))}
                  </div>
                )}

                <span ref={shade} aria-hidden="true" className="pt-shade absolute left-0" style={{ top: groundTop - t * 0.12, width: t * 0.84, height: t * 0.24, transform: `translate3d(${vw * 0.22 - t * 0.42}px, 0, 0)` }} />
                <div ref={hero} data-pose="idle" className="pt-hero absolute left-0" style={{ top: groundTop - t * BODY, transform: `translate3d(${vw * 0.22 - t / 2}px, 0, 0)` }}>
                  <span className="pt-face relative block">
                    <span className={`pt-frames ${cheer ? "pt-cheer" : ""}`}>
                      {Object.entries(FRAMES).map(([k, art]) => (
                        <Pixels key={k} art={art} colors={CHARACTER_COLORS} scale={s} className={`pt-pose-${k}`} />
                      ))}
                    </span>
                    {/* Cincin di tangan saat berlutut. */}
                    <span className="pt-held absolute" style={{ left: 10 * s, top: 6 * s }}>
                      <Pixels art={RING} colors={RING_COLORS} scale={s} />
                    </span>
                  </span>
                </div>

                {/* Koin selalu di lapisan paling atas dunia, di atas papan dan karakter. */}
                {plan.coins.map((c, i) => (
                  <span key={i} ref={(el) => void (coinEls.current[i] = el)} className="pt-coin absolute z-30" style={{ left: c.x * t - (artSize(COIN).w * s) / 2, top: groundTop - c.y * t - artSize(COIN).h * s }}>
                    <Pixels art={COIN} colors={COIN_COLORS} scale={s} />
                  </span>
                ))}
              </div>
            </div>

            {/* Papan status, menu peta, dan tombol kontrol menempel di layar, tidak ikut bergeser. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-15 items-center justify-between gap-3 pr-17 pl-3 sm:h-18 sm:pr-21 sm:pl-5">
              <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} disabled={locked} className="pt-pad pt-pad-menu pointer-events-auto">
                Peta
              </button>
              <p className="pt-label pt-on-sky hidden min-w-0 flex-1 truncate text-[13px] sm:block">
                {groom} <span className="opacity-70">ke</span> {bride}
              </p>
              <p className="pt-label pt-on-sky flex shrink-0 items-center gap-1.5 text-[12px] sm:text-[14px]">
                <Pixels art={COIN} colors={COIN_COLORS} scale={2} />
                <span aria-hidden="true">x</span>
                <span ref={counter} aria-hidden="true">
                  00
                </span>
              </p>
              <p className="pt-label pt-on-sky hidden shrink-0 text-[13px] sm:block">{date}</p>
            </div>
            {menu && (
              <nav aria-label="Peta perjalanan" className="absolute top-16 left-3 z-40 w-[min(280px,calc(100%-24px))] sm:left-5">
                <div className="pt-dialog max-h-[calc(100svh-180px)] overflow-y-auto p-2">
                  <ul>
                    {places.map((p) => (
                      <li key={p.label}>
                        <button
                          type="button"
                          onClick={() => {
                            warp.current(p.x);
                            setMenu(false);
                          }}
                          className="pt-label w-full px-3 py-2.5 text-left text-[12px] hover:bg-white/10 focus-visible:bg-white/10"
                        >
                          &#9654; {p.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            )}
            {/* Tombol arah menempel di tepi kiri dan kanan layar, tombol lompat di tengah bawah. Setelah tamat,
                tombolnya berganti menjadi main lagi dan buka penutup. */}
            {ended ? (
              <div className="pt-controls pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-3 px-3 sm:bottom-3">
                <button type="button" onClick={() => warp.current((vw * 0.22) / t)} className="pt-pad pt-pad-jump pointer-events-auto">
                  Main lagi
                </button>
                <button type="button" onClick={() => setEnding(true)} className="pt-pad pt-pad-jump pointer-events-auto">
                  Tamat
                </button>
              </div>
            ) : (
              <div data-locked={locked ? "" : undefined} className="pt-controls pointer-events-none absolute inset-x-0 bottom-2 flex items-end justify-between px-1.5 sm:bottom-3 sm:px-2">
                <button type="button" aria-label="Jalan ke kiri" data-dir="-1" className="pt-pad" {...pad}>
                  <span aria-hidden="true">&#9664;</span>
                </button>
                <button
                  type="button"
                  aria-label="Lompat"
                  disabled={locked}
                  className="pt-pad pt-pad-jump"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    jumpQueued.current = true;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") jumpQueued.current = true;
                  }}
                >
                  <span aria-hidden="true">Jump</span>
                </button>
                <button type="button" aria-label="Jalan ke kanan" data-dir="1" className="pt-pad" {...pad}>
                  <span aria-hidden="true">&#9654;</span>
                </button>
              </div>
            )}

            {/* Jendela penutup, terbuka dua detik setelah kedua mempelai muncul di atas istana. */}
            {ending && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1E1830]/60 p-3 sm:p-6" onClick={() => setEnding(false)}>
                <div role="dialog" aria-modal="true" aria-label="Penutup" className="pt-box pt-modal flex max-h-full w-[min(560px,100%)] flex-col text-inv-ink" onClick={(e) => e.stopPropagation()}>
                  <div className="pt-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">{finale}</div>
                  <button ref={closeRef} type="button" onClick={() => setEnding(false)} className="pt-btn pt-label m-3 shrink-0 px-5 py-3 text-[12px]">
                    Kembali ke dunia
                  </button>
                </div>
              </div>
            )}
          </div>
        </Zoom>
      </div>
    </section>
  );
}
