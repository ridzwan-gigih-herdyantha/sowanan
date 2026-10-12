import type { CSSProperties, ReactNode } from "react";

// Ornamen tema Sutra. Gambar SVG satu warna dipakai sebagai mask, jadi warnanya mengikuti palet lewat
// currentColor dan tetap tajam di ukuran apa pun.

const ASSET = "/img/arya-kirana";

function masked(src: string): CSSProperties {
  const url = `url(${ASSET}/${src})`;
  return { backgroundColor: "currentColor", maskImage: url, WebkitMaskImage: url, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" };
}

// Karangan daun melingkar untuk lambang monogram.
export function Wreath({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <div aria-hidden="true" className="absolute inset-0" style={masked("wreath.svg")} />
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}

// Hiasan sudut bingkai berupa ulir daun. Gambar aslinya sudut kanan atas, sudut lain dicerminkan.
const CORNERS = { tl: "top-0 left-0 -scale-x-100", tr: "top-0 right-0", bl: "bottom-0 left-0 -scale-100", br: "right-0 bottom-0 -scale-y-100" } as const;
export function Corner({ at, className = "", size = "size-14 sm:size-20" }: { at: keyof typeof CORNERS; className?: string; size?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute ${size} ${CORNERS[at]} ${className}`} style={masked("corner.svg")} />;
}

// Bingkai berhias: garis ganda sampanye dengan hiasan di keempat sudut.
// Bingkai foto memakai corners false supaya hiasan sudut tidak menutupi foto.
export function OrnateFrame({ children, className = "", inner = "", corners = true }: { children: ReactNode; className?: string; inner?: string; corners?: boolean }) {
  return (
    <div className={`relative border border-inv-gold p-1.5 ${className}`}>
      <div className={`relative h-full border border-inv-gold-light ${inner}`}>
        {children}
        {corners && (["tl", "tr", "bl", "br"] as const).map((c) => <Corner key={c} at={c} className="m-1.5 text-inv-gold" />)}
      </div>
    </div>
  );
}

// Pembatas garis dengan ulir di tengah.
export function Flourish({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`mx-auto aspect-[2611/262] w-56 text-inv-gold sm:w-72 ${className}`} style={masked("divider.svg")} />;
}

// Motif quatrefoil samar untuk latar, dipakai lewat mask supaya warnanya mengikuti palet.
const QUATREFOIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="#000" stroke-width="1"><circle cx="24" cy="15" r="9"/><circle cx="33" cy="24" r="9"/><circle cx="24" cy="33" r="9"/><circle cx="15" cy="24" r="9"/></g></svg>`;
export function pattern(color = "var(--inv-gold)", opacity = 0.1, size = 48): CSSProperties {
  const mask = `url("data:image/svg+xml,${encodeURIComponent(QUATREFOIL)}") 0 0 / ${size}px repeat`;
  return { backgroundColor: color, opacity, mask, WebkitMask: mask };
}

export function Pattern({ opacity = 0.09, className = "" }: { opacity?: number; className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`} style={pattern("var(--inv-gold)", opacity)} />;
}

// Simpul pita emas. Warnanya bawaan gambar, diredam sedikit supaya selaras dengan sampanye palet.
export function Bow({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${ASSET}/bow.svg`} alt="" aria-hidden="true" className={`aspect-[188/159] saturate-[.55] ${className}`} />;
}

// Sudut foto album, segitiga kecil di keempat sudut foto.
export function PhotoCorners() {
  const tri = "absolute size-5 bg-inv-gold-light [clip-path:polygon(0_0,100%_0,0_100%)] shadow-[0_1px_2px_rgba(0,0,0,.1)]";
  return (
    <>
      <span aria-hidden="true" className={`${tri} -top-1 -left-1`} />
      <span aria-hidden="true" className={`${tri} -top-1 -right-1 rotate-90`} />
      <span aria-hidden="true" className={`${tri} -right-1 -bottom-1 rotate-180`} />
      <span aria-hidden="true" className={`${tri} -bottom-1 -left-1 -rotate-90`} />
    </>
  );
}
