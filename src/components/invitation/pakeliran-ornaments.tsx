import type { CSSProperties } from "react";

// Ornamen tema Pakeliran: motif kecil untuk judul, tekstur batik untuk latar, dan pita tenun untuk pembatas.

export type MotifName = "kawung" | "truntum" | "wajik" | "ceplok" | "tumpal" | "sekar";

const ring = (n: number, step: number, el: (deg: number) => string) =>
  Array.from({ length: n }, (_, i) => el(i * step)).join("");

const MOTIF: Record<MotifName, string> = {
  kawung:
    ring(4, 90, (d) => `<ellipse cx="12" cy="6.4" rx="3.3" ry="5.3" transform="rotate(${d + 45} 12 12)"/>`) +
    '<circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  truntum:
    ring(8, 45, (d) => `<ellipse cx="12" cy="5.6" rx="1.5" ry="2.8" transform="rotate(${d} 12 12)"/>`) +
    '<circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
  wajik: '<path d="M12 1.5 22.5 12 12 22.5 1.5 12Z"/><path d="M12 7 17 12 12 17 7 12Z" fill="currentColor" stroke="none"/>',
  ceplok:
    '<path d="M12 2c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>' +
    ring(4, 90, (d) => `<circle cx="12" cy="3.5" r=".9" fill="currentColor" stroke="none" transform="rotate(${d + 45} 12 12)"/>`),
  tumpal: '<path d="M12 2 21 22H3Z"/><path d="M12 9 16.5 19h-9Z" fill="currentColor" stroke="none"/><path d="M12 2v7"/>',
  sekar: ring(5, 72, (d) => `<circle cx="12" cy="6.6" r="3.4" transform="rotate(${d} 12 12)"/>`) + '<circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
};

export function Motif({ name, className = "" }: { name: MotifName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden="true"
      className={`size-7 shrink-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: MOTIF[name] }}
    />
  );
}

// Tekstur latar batik, digambar sebagai SVG berulang dengan warna dan kepekatan yang bisa diatur.
const TILES = {
  kawung: {
    size: 56,
    body: (c: string) => {
      const cluster = (x: number, y: number) =>
        ring(4, 90, (d) => `<ellipse cx="${x}" cy="${y - 7.5}" rx="4.6" ry="7.5" transform="rotate(${d + 45} ${x} ${y})"/>`) +
        `<circle cx="${x}" cy="${y}" r="1.4" fill="${c}"/>`;
      return `<g fill="none" stroke="${c}" stroke-width=".9">${cluster(28, 28)}${cluster(0, 0)}${cluster(56, 0)}${cluster(0, 56)}${cluster(56, 56)}</g>`;
    },
  },
  truntum: {
    size: 64,
    body: (c: string) => {
      const flower = (x: number, y: number) =>
        ring(8, 45, (d) => `<circle cx="${x}" cy="${y - 4.6}" r="1.3" transform="rotate(${d} ${x} ${y})"/>`) +
        `<circle cx="${x}" cy="${y}" r="1.6"/>`;
      return `<g fill="${c}">${flower(16, 16)}${flower(48, 48)}<circle cx="48" cy="16" r=".9"/><circle cx="16" cy="48" r=".9"/></g>`;
    },
  },
  nitik: {
    size: 18,
    body: (c: string) => `<g fill="${c}"><path d="M9 6.5 11.5 9 9 11.5 6.5 9Z"/><circle cx="0" cy="0" r="1"/><circle cx="18" cy="0" r="1"/><circle cx="0" cy="18" r="1"/><circle cx="18" cy="18" r="1"/></g>`,
  },
  ceplok: {
    size: 44,
    body: (c: string) =>
      `<g fill="none" stroke="${c}" stroke-width=".9"><path d="M22 10c.8 7 3 9.2 12 12-9 2.8-11.2 5-12 12-.8-7-3-9.2-12-12 9-2.8 11.2-5 12-12Z"/><circle cx="0" cy="0" r="5"/><circle cx="44" cy="0" r="5"/><circle cx="0" cy="44" r="5"/><circle cx="44" cy="44" r="5"/></g>`,
  },
} as const;

export type TextureName = keyof typeof TILES;

export function texture(name: TextureName, color: string, opacity: number, scale = 1): CSSProperties {
  const { size, body } = TILES[name];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" opacity="${opacity}">${body(color)}</svg>`;
  return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundSize: `${size * scale}px` };
}

// Ukiran lung-lungan satu warna. Gambarnya dipakai sebagai mask, warnanya mengikuti warna teks (currentColor).
const LUNG = {
  sudut: { src: "/img/danang-kinanthi/lung-sudut.webp", ratio: "1 / 1" },
  mahkota: { src: "/img/danang-kinanthi/lung-mahkota.webp", ratio: "2.6 / 1" },
  tepi: { src: "/img/danang-kinanthi/lung-tepi.webp", ratio: "7.6 / 1" },
} as const;

const CORNER = { tl: "top-0 left-0", tr: "top-0 right-0 -scale-x-100", bl: "bottom-0 left-0 -scale-y-100", br: "right-0 bottom-0 -scale-100" };

export function Lung({ name, corner, className = "" }: { name: keyof typeof LUNG; corner?: keyof typeof CORNER; className?: string }) {
  const { src, ratio } = LUNG[name];
  const mask = `url(${src}) center / contain no-repeat`;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none block bg-current ${corner ? `absolute ${CORNER[corner]}` : ""} ${className}`}
      style={{ aspectRatio: ratio, mask, WebkitMask: mask }}
    />
  );
}

// Pita tenun lurik dan jarik wiru sebagai pembatas bagian.
export function Lurik({ variant = "a", className = "" }: { variant?: "a" | "b"; className?: string }) {
  return <div aria-hidden="true" className={`pk-lurik ${variant === "b" ? "pk-lurik-b" : ""} ${className}`} />;
}

export function Wiru({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`pk-wiru ${className}`} />;
}

export function Seret({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`pk-seret ${className}`} />;
}
