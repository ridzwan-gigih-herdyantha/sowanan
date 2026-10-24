import { litPath } from "./moon";

// Foto bulan purnama, dirasterkan dari SVG aset. Versi kecil untuk ikon fase supaya tidak mengunduh gambar besar.
export const MOON = { large: "/img/bima-nadia/moon.webp", small: "/img/bima-nadia/moon-sm.webp" };

// Permukaan bulan: foto dipotong mask fase bertepi lembut, diberi rona cahaya bulan dari palet.
// Sisi gelap tetap samar seperti cahaya bumi. id wajib unik per halaman.
export function MoonFace({ id, d, small = false, blur = 1.6 }: { id: string; d: string; small?: boolean; blur?: number }) {
  const src = small ? MOON.small : MOON.large;
  return (
    <>
      <defs>
        <filter id={`${id}-edge`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
        <mask id={`${id}-lit`} maskUnits="userSpaceOnUse" x="-56" y="-56" width="112" height="112">
          <path d={d} fill="#fff" filter={`url(#${id}-edge)`} data-moon-lit />
        </mask>
      </defs>
      <circle r="49.4" style={{ fill: "var(--inv-night)" }} />
      <image href={src} x="-50" y="-50" width="100" height="100" opacity="0.14" />
      <g mask={`url(#${id}-lit)`}>
        <image href={src} x="-50" y="-50" width="100" height="100" />
        <circle r="50" style={{ fill: "var(--inv-accent)", mixBlendMode: "multiply" }} opacity="0.4" />
      </g>
    </>
  );
}

// Halo cahaya bulan di belakang piringan. Terangnya mengikuti seberapa penuh bulan.
export function MoonHalo({ id, light }: { id: string; light: number }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0.45" style={{ stopColor: "var(--inv-accent)", stopOpacity: 0.3 }} />
          <stop offset="1" style={{ stopColor: "var(--inv-accent)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <circle r="58" fill={`url(#${id}-halo)`} opacity={0.2 + light * 0.8} data-moon-halo />
    </>
  );
}

// Bulan dengan fase tertentu. small memakai gambar kecil dan tanpa halo, untuk ikon fase di pembatas dan garis waktu.
export function MoonDisc({ age, id, className = "", glow = true, small = false }: { age: number; id: string; className?: string; glow?: boolean; small?: boolean }) {
  return (
    <svg viewBox="-58 -58 116 116" aria-hidden="true" className={`overflow-visible ${className}`}>
      {glow && <MoonHalo id={id} light={Math.sin(Math.PI * age)} />}
      <MoonFace id={id} d={litPath(age, 50)} small={small} blur={small ? 2.4 : 1.6} />
    </svg>
  );
}
