"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { artSize, artUri, BUSH, CHARACTER_COLORS, CLOUD, CLOUD_COLORS, DIRT_TILE, GRASS_TILE, GROOM_IDLE, GROUND_COLORS, SUN, TREE, TREE_COLORS, type Art, type Palette } from "./art";
import { shapes } from "./runs";

// Ukuran ubin mengikuti layar dan selalu kelipatan 16, jadi satu piksel gambar tepat 2, 3, atau 4 piksel layar.
export function tileFor(w: number, h: number) {
  return 16 * Math.min(4, Math.max(2, Math.floor(Math.min(h / 14, w / 7) / 16)));
}

// w dan h adalah ukuran panggung sebelum diperkecil. Di layar HP seluruh panggung diperkecil sedikit (zoom),
// jadi dunia yang terlihat lebih luas dan papan tidak terasa terlalu besar. ready menandai ukuran yang sudah diukur
// dari layar sungguhan, bukan ukuran cadangan dari server.
export type Size = { w: number; h: number; t: number; zoom: number; ready: boolean };
const ZOOM = 0.86;
const FLOORS = 19;

function sizeFor(w: number, h: number): Size {
  const zoom = w < 640 ? ZOOM : 1;
  const vw = Math.round(w / zoom);
  const vh = Math.round(h / zoom);
  // Di layar lebar ubin dibatasi supaya tinggi layar muat paling sedikit FLOORS ubin, cukup untuk cerita dua lantai.
  const fit = Math.max(32, 16 * Math.floor(vh / FLOORS / 16));
  return { w: vw, h: vh, t: zoom < 1 ? 32 : Math.min(tileFor(vw, vh), fit), zoom, ready: true };
}
const FALLBACK = { ...sizeFor(390, 844), ready: false };

export function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<Size>(FALLBACK);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      // Saat tamu mengetik, keyboard layar mengecilkan tinggi layar. Ukuran ubin ditahan supaya level tidak bergeser.
      if (document.activeElement?.closest("input, textarea, select")) return;
      const next = sizeFor(el.clientWidth, el.clientHeight);
      setSize((s) => (s.ready && s.w === next.w && s.h === next.h ? s : next));
    };
    const ro = new ResizeObserver(read);
    ro.observe(el);
    read();
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export const hash = (x: number, s = 0) => {
  const n = Math.sin(x * 127.1 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
};

// Gambar piksel di dalam halaman, untuk aset yang warnanya ikut palet atau perlu diganti bingkainya.
export function Pixels({ art, colors, scale, className = "", style }: { art: Art; colors: Palette; scale: number; className?: string; style?: CSSProperties }) {
  const { w, h } = artSize(art);
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} width={w * scale} height={h * scale} shapeRendering="crispEdges" className={`block shrink-0 overflow-visible ${className}`} style={style}>
      {shapes(art).map((r) => {
        // Warna jadi ditulis sebagai atribut, hanya warna dari variabel CSS yang perlu gaya inline.
        const c = colors[r.c] ?? r.c;
        return c.startsWith("var(") || c.startsWith("color-mix(") ? <path key={r.c} d={r.d} style={{ fill: c }} /> : <path key={r.c} d={r.d} fill={c} />;
      })}
    </svg>
  );
}

// Aset berulang dipasang sebagai latar gambar, ukurannya dikalikan skala piksel.
export function Img({ art, colors, scale, style, className = "" }: { art: Art; colors: Palette; scale: number; style?: CSSProperties; className?: string }) {
  const { w, h } = artSize(art);
  return (
    <span
      aria-hidden="true"
      className={`absolute block ${className}`}
      style={{ width: w * scale, height: h * scale, backgroundImage: artUri(art, colors), backgroundSize: "100% 100%", imageRendering: "pixelated", ...style }}
    />
  );
}

export function groundStyle(t: number): CSSProperties {
  return {
    height: t * 2,
    backgroundColor: GROUND_COLORS.D,
    backgroundImage: `${artUri(GRASS_TILE, GROUND_COLORS)}, ${artUri(DIRT_TILE, GROUND_COLORS)}`,
    backgroundSize: `${t}px ${t}px`,
    backgroundRepeat: "repeat-x, repeat",
    backgroundPosition: `0 0, 0 ${t}px`,
    imageRendering: "pixelated",
  };
}

// Gunung bertangga dengan sisi terang dan sisi bayangan serta puncak bersalju, satuan dalam piksel gambar. Setiap warna
// menjadi satu path.
function mountains(width: number, height: number) {
  const out = { a: "", b: "", c: "" };
  const add = (x: number, y: number, w: number, tone: keyof typeof out) => (out[tone] += `M${x} ${y}h${w}v2h-${w}z`);
  for (let i = 0, x = -20; x < width + 40; i++) {
    const peak = Math.round(height * (0.45 + hash(i, 1) * 0.4));
    const cx = x + 30;
    for (let r = 0; r < peak; r += 2) {
      const half = Math.round(r * 0.95) + 2;
      const y = height - peak + r;
      const snow = r < peak * 0.2;
      add(cx - half, y, half, snow ? "c" : "a");
      add(cx, y, half, snow ? "c" : "b");
    }
    x += 46 + Math.round(hash(i, 2) * 40);
  }
  return out;
}

// Bukit hijau bergelombang: garis atas terang lalu badan bukit, dengan tepi bertangga dua piksel.
function hillPath(width: number, height: number, base: number, amp: number, seed: number, lift = 0) {
  let d = `M0 ${height}`;
  for (let x = 0; x <= width + 4; x += 4) {
    const wave = Math.sin(x / 61 + seed) * 0.6 + Math.sin(x / 27 + seed * 2.3) * 0.4;
    const y = Math.round((base - wave * amp) / 2) * 2 + lift;
    d += ` L${x} ${y} L${x + 4} ${y}`;
  }
  return `${d} L${width + 4} ${height} Z`;
}

// Latar dunia game: langit bertingkat, matahari, gunung dan bukit berlapis, awan, pepohonan, dan tanah.
// cam adalah posisi kamera dalam piksel layar. Lapisan jauh bergeser lebih lambat dari lapisan dekat.
// Bila layers diberi, transform tiap lapisan diatur dari luar tanpa merender ulang.
export function Land({ size, width, layers, decor = true }: { size: Size; width: number; layers?: RefObject<(HTMLElement | null)[]>; decor?: boolean }) {
  const { w: vw, h: vh, t } = size;
  const s = t / 16;
  const far = vw + (width - vw) * 0.2;
  const near = vw + (width - vw) * 0.45;
  const sky = vw + (width - vw) * 0.1;
  const mh = Math.round((vh * 0.42) / s);
  const hh = Math.round((vh * 0.3) / s);

  const peaks = useMemo(() => mountains(Math.ceil(far / s), mh), [far, s, mh]);
  const hills = useMemo(() => {
    const gw = Math.ceil(near / s);
    return { gw, back: hillPath(gw, hh, hh * 0.42, hh * 0.18, 1.3), back2: hillPath(gw, hh, hh * 0.42, hh * 0.18, 1.3, 2), front: hillPath(gw, hh, hh * 0.68, hh * 0.14, 4.1), front2: hillPath(gw, hh, hh * 0.68, hh * 0.14, 4.1, 2) };
  }, [near, s, hh]);
  const clouds = useMemo(() => Array.from({ length: Math.ceil(sky / 260) + 1 }, (_, i) => ({ x: Math.round(i * 260 + hash(i, 7) * 120), y: Math.round(6 + hash(i, 8) * 24), k: hash(i, 9) > 0.5 ? 1 : 0.7 })), [sky]);
  const trees = useMemo(() => {
    if (!decor) return [];
    const out: { x: number; kind: "tree" | "bush" }[] = [];
    for (let i = 0, x = 1.5; x < width / t - 1; i++) {
      out.push({ x, kind: hash(i, 11) > 0.45 ? "tree" : "bush" });
      x += 3 + Math.round(hash(i, 12) * 12) / 2;
    }
    return out;
  }, [width, t, decor]);
  const set = (i: number) => (el: HTMLElement | null) => {
    if (layers?.current) layers.current[i] = el;
  };
  const ground = vh - t * 2;

  return (
    <div aria-hidden="true" className="pt-sky pointer-events-none absolute inset-0 overflow-hidden">
      {/* Bintang digambar sebagai bayangan kotak di tiga elemen dengan jeda kedip berbeda, bukan satu elemen beranimasi
          per bintang yang masing-masing menjadi lapisan terpisah. */}
      <div className="absolute inset-0" style={{ opacity: "var(--inv-stars, 1)" }}>
        {[0, 1, 2].map((g) => (
          <span
            key={g}
            className="pt-star absolute top-0 left-0 size-1"
            style={{
              boxShadow: Array.from({ length: 14 }, (_, i) => i)
                .filter((i) => i % 3 === g)
                .map((i) => `${Math.round(hash(i, 3) * vw)}px ${Math.round(hash(i, 4) * 0.26 * vh)}px #FFF6E5`)
                .join(", "),
              animationDelay: `${g * 0.8}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute left-[62%] sm:left-[70%]" style={{ top: vh * 0.12 }}>
        <Pixels art={SUN} colors={{ Y: "var(--inv-sun)", y: "color-mix(in srgb, var(--inv-sun) 80%, var(--inv-accent))", W: "#FFFFFF" }} scale={Math.max(3, s * 1.5)} />
      </div>
      <div ref={set(0)} className="absolute top-0 left-0 h-full will-change-transform" style={{ width: sky }}>
        {clouds.map((c, i) => (
          <Img key={i} art={CLOUD} colors={CLOUD_COLORS} scale={s * c.k} style={{ left: c.x, top: `${c.y}%` }} />
        ))}
      </div>
      <svg ref={set(1) as never} viewBox={`0 0 ${Math.ceil(far / s)} ${mh}`} preserveAspectRatio="none" shapeRendering="crispEdges" className="absolute left-0 will-change-transform" style={{ width: Math.ceil(far / s) * s, height: mh * s, top: ground - mh * s + t * 0.6 }}>
        <path d={peaks.a} style={{ fill: "color-mix(in srgb, var(--inv-hill) 35%, var(--inv-horizon))" }} />
        <path d={peaks.b} style={{ fill: "color-mix(in srgb, var(--inv-hill) 50%, color-mix(in srgb, var(--inv-sky) 50%, var(--inv-horizon)))" }} />
        <path d={peaks.c} fill="#F4F7FB" />
      </svg>
      <svg ref={set(2) as never} viewBox={`0 0 ${hills.gw} ${hh}`} preserveAspectRatio="none" shapeRendering="crispEdges" className="absolute left-0 will-change-transform" style={{ width: hills.gw * s, height: hh * s, top: ground - hh * s + t * 0.4 }}>
        <path d={hills.back} style={{ fill: "color-mix(in srgb, var(--inv-hill) 55%, #B8F08A)" }} />
        <path d={hills.back2} style={{ fill: "color-mix(in srgb, var(--inv-hill) 75%, var(--inv-horizon))" }} />
        <path d={hills.front} style={{ fill: "color-mix(in srgb, var(--inv-hill) 70%, #B8F08A)" }} />
        <path d={hills.front2} style={{ fill: "var(--inv-hill)" }} />
      </svg>
      <div ref={set(3)} className="absolute left-0 will-change-transform" style={{ width, top: 0, height: vh }}>
        {trees.map((d, i) =>
          d.kind === "tree" ? (
            <Img key={i} art={TREE} colors={TREE_COLORS} scale={s * 1.5} style={{ left: d.x * t, top: ground - artSize(TREE).h * s * 1.5 }} />
          ) : (
            <Img key={i} art={BUSH} colors={TREE_COLORS} scale={s} style={{ left: d.x * t, top: ground - artSize(BUSH).h * s }} />
          ),
        )}
        <div className="absolute inset-x-0 bottom-0" style={groundStyle(t)} />
      </div>
    </div>
  );
}

// Panggung yang diperkecil sesuai zoom. Isinya disusun di ukuran sebelum diperkecil. Sebelum layar terukur, isinya
// disembunyikan supaya susunan ukuran HP dari server tidak sempat terlihat di layar lebar.
export function Zoom({ size, children }: { size: Size; children: ReactNode }) {
  return (
    <div className={`absolute top-0 left-0 ${size.ready ? "" : "pt-wait"}`} style={{ width: size.w, height: size.h, transform: size.zoom === 1 ? undefined : `scale(${size.zoom})`, transformOrigin: "0 0" }}>
      {children}
    </div>
  );
}

// Latar diam untuk pembuka, dengan mempelai pria di garis start di posisi yang sama dengan awal level.
export function Backdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const size = useSize(ref);
  return (
    <div ref={ref} className="pt-sky absolute inset-0 overflow-hidden">
      <Zoom size={size}>
        <Land size={size} width={size.w} />
        <span className="pt-bob absolute" style={{ left: size.w * 0.22 - size.t / 2, top: size.h - size.t * 3.5 }}>
          <Pixels art={GROOM_IDLE} colors={CHARACTER_COLORS} scale={size.t / 16} />
        </span>
      </Zoom>
    </div>
  );
}
