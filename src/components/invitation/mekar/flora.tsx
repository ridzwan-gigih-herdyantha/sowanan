import Image from "next/image";
import type { CSSProperties } from "react";

// Potongan bunga cat air di public/img/ivan-mawar/bunga-N/<set>/. Ukuran asli dipakai untuk rasio gambar, isi
// tiap set sama, hanya warna kelopaknya yang berbeda.
const PIECES = {
  buket: [1319, 1106],
  untaian: [1516, 732],
  rangkaian: [1489, 1048],
  "buket-kecil": [758, 767],
  "mawar-1": [482, 452],
  "mawar-2": [468, 425],
  "mawar-3": [497, 482],
  sapuan: [1600, 1067],
  tiang: [468, 1400],
  deret: [1282, 655],
  "daun-1": [258, 617],
  "daun-2": [300, 512],
  "daun-3": [201, 508],
} as const;

export type Piece = keyof typeof PIECES;

// Berkas di folder set yang bukan potongan bunga.
type Asset = Piece | "kolibri";

// Nomor di nama folder dinaikkan setiap kali gambar diganti, supaya peramban dan pengoptimal gambar tidak memakai
// salinan lama dari cache.
const DIR = "/img/ivan-mawar/bunga-6";

export const floraSrc = (set: string, piece: Asset) => `${DIR}/${set}/${piece}.webp`;

type Props = { set: string; piece: Piece; className?: string; style?: CSSProperties; sizes?: string; sway?: boolean; priority?: boolean };

// Hiasan bunga. Selalu dekoratif, jadi tidak dibacakan pembaca layar dan tidak bisa diklik.
export function Flora({ set, piece, className = "", style, sizes = "240px", sway = false, priority = false }: Props) {
  const [w, h] = PIECES[piece];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute select-none ${className}`} style={style}>
      <Image src={floraSrc(set, piece)} alt="" width={w} height={h} sizes={sizes} priority={priority} className={`h-auto w-full ${sway ? "mm-sway" : ""}`} />
    </div>
  );
}

// Sapuan cat air sebagai latar bagian, menutup seluruh bagian dan berada di belakang isinya.
export function Wash({ set, className = "", flip = "" }: { set: string; className?: string; flip?: "" | "x" | "y" | "xy" }) {
  const t = { "": "", x: "-scale-x-100", y: "-scale-y-100", xy: "rotate-180" }[flip];
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <Image src={floraSrc(set, "sapuan")} alt="" fill sizes="100vw" className={`object-cover ${t}`} />
    </div>
  );
}
