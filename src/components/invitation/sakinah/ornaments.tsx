import type { CSSProperties, ReactNode } from "react";

// Ornamen tema Sakinah. Semuanya geometri yang dihitung, bukan gambar, jadi tajam di ukuran apa pun
// dan warnanya mengikuti palet lewat currentColor atau CSS variable.

type P = [number, number];
const f = (n: number) => n.toFixed(2);
const poly = (pts: P[]) => "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L") + "Z";

// Bintang delapan (khatam): dua persegi bertumpuk. Jari dalam = R x cos45 / cos22.5.
export function star8(cx: number, cy: number, R: number, rot = 0): string {
  const r = (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8);
  const pts: P[] = [];
  for (let i = 0; i < 16; i++) {
    const a = rot + (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 ? r : R;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return poly(pts);
}

const circle = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

// Tekstur latar sebagai mask, supaya warnanya bisa CSS variable dari palet.
const TILES = {
  khatam: {
    size: 48,
    svg: `<g fill="none" stroke="#000" stroke-width="1"><path d="${star8(24, 24, 15)}"/><path d="${star8(0, 0, 15)}"/><path d="${star8(48, 0, 15)}"/><path d="${star8(0, 48, 15)}"/><path d="${star8(48, 48, 15)}"/><path d="${star8(24, 24, 6, Math.PI / 8)}"/></g>`,
  },
  lingkar: {
    size: 36,
    svg: `<g fill="none" stroke="#000" stroke-width=".9">${[0, 36].flatMap((x) => [0, 36].map((y) => circle(x, y, 18))).join("")}${circle(18, 18, 18)}</g>`,
  },
  zellige: {
    size: 40,
    svg: `<g fill="#000"><path d="${star8(20, 20, 8)}"/><path d="${poly([[0, -4], [4, 0], [0, 4], [-4, 0]])}"/><path d="${poly([[40, -4], [44, 0], [40, 4], [36, 0]])}"/><path d="${poly([[0, 36], [4, 40], [0, 44], [-4, 40]])}"/><path d="${poly([[40, 36], [44, 40], [40, 44], [36, 40]])}"/></g>`,
  },
} as const;

export type Tile = keyof typeof TILES;

export function pattern(name: Tile, color: string, opacity: number, scale = 1): CSSProperties {
  const { size, svg } = TILES[name];
  const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${svg}</svg>`;
  const mask = `url("data:image/svg+xml,${encodeURIComponent(src)}") 0 0 / ${size * scale}px repeat`;
  return { backgroundColor: color, opacity, mask, WebkitMask: mask };
}

export function Pattern({ name, color, opacity, scale, className = "" }: { name: Tile; color: string; opacity: number; scale?: number; className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`} style={pattern(name, color, opacity, scale)} />;
}

const CORNERS = { tl: "top-0 left-0", tr: "top-0 right-0 -scale-x-100", bl: "bottom-0 left-0 -scale-y-100", br: "right-0 bottom-0 -scale-100" };

// Lajur kisi mashrabiya: deretan bintang kecil dan lingkaran yang saling mengunci.
const LATTICE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#000" stroke-width="1.2"><path d="${star8(12, 12, 7)}"/>${circle(0, 0, 5)}${circle(24, 0, 5)}${circle(0, 24, 5)}${circle(24, 24, 5)}</g></svg>`;

export function Lattice({ className = "", size = 24 }: { className?: string; size?: number }) {
  const mask = `url("data:image/svg+xml,${encodeURIComponent(LATTICE)}") 0 0 / ${size}px repeat`;
  return <div aria-hidden="true" className={`pointer-events-none bg-current ${className}`} style={{ mask, WebkitMask: mask }} />;
}

// Bintang delapan kecil untuk judul dan penanda.
export function Star({ className = "size-5", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={star8(12, 12, 11)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <path d={star8(12, 12, 4.5, Math.PI / 8)} fill="currentColor" />
    </svg>
  );
}

// Lengkung runcing (lengkung lancet) sebagai mask: tutup atas setinggi separuh lebar, sisanya persegi.
// Wadah memakai container query supaya tinggi tutup selalu sebanding dengan lebarnya.
const CAP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M0 100C0 46 42 12 100 0C158 12 200 46 200 100Z"/></svg>`;
const CAP_URL = `url("data:image/svg+xml,${encodeURIComponent(CAP)}")`;
export const ARCH_MASK: CSSProperties = {
  mask: `${CAP_URL} top center / 100% 50cqw no-repeat, linear-gradient(#000 0 0) bottom / 100% calc(100% - 50cqw + 1px) no-repeat`,
  WebkitMask: `${CAP_URL} top center / 100% 50cqw no-repeat, linear-gradient(#000 0 0) bottom / 100% calc(100% - 50cqw + 1px) no-repeat`,
};

// Bingkai lengkung berlapis: garis emas, celah, lalu isi. Ukuran ditentukan className (lebar dan tinggi atau aspect).
export function Arch({ children, className = "", line = "var(--sk-emas)", gap = "var(--inv-paper)", inner = "" }: { children: ReactNode; className?: string; line?: string; gap?: string; inner?: string }) {
  return (
    <div className={`${/(absolute|fixed)/.test(className) ? "" : "relative"} [container-type:inline-size] ${className}`}>
      <div className="absolute inset-0" style={{ ...ARCH_MASK, background: line }} />
      <div className="absolute inset-[2px] [container-type:inline-size]">
        <div className="absolute inset-0" style={{ ...ARCH_MASK, background: gap }} />
        <div className="absolute inset-[5px] [container-type:inline-size]">
          <div className={`absolute inset-0 overflow-hidden ${inner}`} style={ARCH_MASK}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lentera (fanous): kubah, badan segi enam berkisi, dan ujung runcing. Logam memakai currentColor.
export function Lantern({ className = "", lit = 1, chain = 40 }: { className?: string; lit?: number; chain?: number }) {
  const t = chain;
  return (
    <svg viewBox={`0 0 60 ${t + 104}`} aria-hidden="true" className={className} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="sk-lantern-glow">
          <stop offset="0" stopColor="var(--sk-glow)" stopOpacity=".95" />
          <stop offset=".45" stopColor="var(--sk-glow)" stopOpacity=".35" />
          <stop offset="1" stopColor="var(--sk-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="30" cy={t + 46} r="46" fill="url(#sk-lantern-glow)" opacity={lit * 0.85} />
      {/* Tali sengaja dimulai jauh di atas supaya selalu menyambung ke tepi atas bagian. */}
      <path d={`M30 -600V${t}`} stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2.5" />
      <g fill="currentColor">
        <circle cx="30" cy={t + 2} r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d={`M17 ${t + 18}C17 ${t + 10} 23 ${t + 6} 30 ${t + 5}C37 ${t + 6} 43 ${t + 10} 43 ${t + 18}Z`} />
        <rect x="14" y={t + 18} width="32" height="4" rx="1" />
      </g>
      <path d={`M14 ${t + 22}H46L50 ${t + 44}L46 ${t + 70}H14L10 ${t + 44}Z`} fill="var(--sk-glow)" opacity={0.25 + lit * 0.6} />
      <g fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d={`M14 ${t + 22}H46L50 ${t + 44}L46 ${t + 70}H14L10 ${t + 44}Z`} />
        <path d={`M23 ${t + 22}L21 ${t + 44}L23 ${t + 70}M37 ${t + 22}L39 ${t + 44}L37 ${t + 70}M10 ${t + 44}H50`} />
        <path d={star8(30, t + 44, 7)} />
      </g>
      <g fill="currentColor">
        <rect x="13" y={t + 70} width="34" height="4" rx="1" />
        <path d={`M18 ${t + 74}H42L30 ${t + 92}Z`} />
        <circle cx="30" cy={t + 96} r="2.6" />
        <path d={`M29.3 ${t + 98}H30.7V${t + 104}H29.3Z`} />
      </g>
    </svg>
  );
}

// Ornamen Canva (scripts/sakinah-assets.ts). Ukiran satu warna dipakai sebagai mask, warnanya mengikuti currentColor.
const HIAS = {
  mahkota: { src: "/img/fadhil-nayla/sk-mahkota.webp", ratio: "1.98 / 1" },
  sudut: { src: "/img/fadhil-nayla/sk-sudut.webp", ratio: "1 / 1" },
  pita: { src: "/img/fadhil-nayla/sk-pita.webp", ratio: "4.5 / 1" },
} as const;

export function Hias({ name, corner, className = "", style }: { name: keyof typeof HIAS; corner?: keyof typeof CORNERS; className?: string; style?: CSSProperties }) {
  const { src, ratio } = HIAS[name];
  const mask = `url(${src}) center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block bg-current ${corner ? `absolute ${CORNERS[corner]}` : ""} ${className}`}
      style={{ aspectRatio: ratio, mask, WebkitMask: mask, ...style }}
    />
  );
}

// Pita arabesque berulang mendatar.
export function Pita({ className = "" }: { className?: string }) {
  const mask = `url(${HIAS.pita.src}) left center / auto 100% repeat-x`;
  return <div aria-hidden="true" className={`pointer-events-none bg-current ${className}`} style={{ mask, WebkitMask: mask }} />;
}

// Rangkaian bunga watercolor. Gambar aslinya rumpun di kiri bawah, dicerminkan untuk sisi kanan.
export function Bunga({ side = "l", className = "" }: { side?: "l" | "r"; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/img/fadhil-nayla/sk-bunga.webp"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`pointer-events-none block h-auto select-none ${side === "r" ? "-scale-x-100" : ""} ${className}`}
    />
  );
}

// Kartu berbentuk lengkung yang tingginya mengikuti isi. Setiap lapis dibungkus wadah sendiri
// karena satuan cqw mengacu ke wadah di atasnya, bukan ke elemen itu sendiri.
export function ArchCard({ children, className = "", line = "var(--sk-emas)", fill = "var(--inv-paper)", cap = "pt-[42cqw]" }: { children: ReactNode; className?: string; line?: string; fill?: string; cap?: string }) {
  return (
    <div className={`[container-type:inline-size] ${className}`}>
      <div className="p-[2px]" style={{ ...ARCH_MASK, background: line }}>
        <div className="[container-type:inline-size]">
          <div className={`relative ${cap}`} style={{ ...ARCH_MASK, background: fill }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
