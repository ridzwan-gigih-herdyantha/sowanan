import type { CSSProperties } from "react";

export const PUPPETS = {
  kamajaya: "/img/danang-kinanthi/kamajaya.webp",
  kamaratih: "/img/danang-kinanthi/kamaratih.webp",
  gunungan: "/img/danang-kinanthi/gunungan.webp",
} as const;

export type PuppetName = keyof typeof PUPPETS;

// Dikirim pintu pembuka saat pagelaran selesai, supaya hero memulai animasi masuknya.
export const ENTER_EVENT = "pakeliran:enter";

export const ORNAMENTS = {
  gebyok: "/img/danang-kinanthi/gebyok.webp",
  sudut: "/img/danang-kinanthi/sudut.webp",
  parang: "/img/danang-kinanthi/parang.webp",
} as const;

// Sudut ukir lung-lungan emas, dicerminkan untuk tiap sudut.
export function Sudut({ corner, className = "" }: { corner: "tl" | "tr" | "bl" | "br"; className?: string }) {
  const pos = { tl: "top-0 left-0", tr: "top-0 right-0 -scale-x-100", bl: "bottom-0 left-0 -scale-y-100", br: "right-0 bottom-0 -scale-100" }[corner];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ORNAMENTS.sudut} alt="" aria-hidden="true" loading="lazy" className={`pointer-events-none absolute w-16 select-none sm:w-20 ${pos} ${className}`} />
  );
}

// Pita batik parang sebagai pembatas antar bagian.
export function BatikBand({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-7 border-y-[3px] border-[#B8995E] ${className}`}
      style={{ backgroundImage: `url(${ORNAMENTS.parang})`, backgroundSize: "220px", backgroundPosition: "center" }}
    />
  );
}

// Wayang prada, atau bayangannya di kelir (gambar yang sama dibuat gelap dan sedikit kabur).
export function Puppet({
  name,
  shadow = false,
  className = "",
  style,
  eager = false,
}: {
  name: PuppetName;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={PUPPETS[name]}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`pointer-events-none block h-full w-auto max-w-none select-none ${className}`}
      style={shadow ? { filter: "brightness(0) blur(1.5px)", opacity: 0.55, ...style } : style}
    />
  );
}
