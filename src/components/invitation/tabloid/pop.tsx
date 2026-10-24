import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { FrameProps } from "@/lib/invitation/frame";

// Elemen retro pop Tabloid Asmara. Semua warnanya dari variabel palet, jadi ikut berganti saat palet diganti.

// Foto berwarna asli dengan bingkai tebal dan bayangan sablon.
export function Panel({ src, frame, alt, sizes, className = "", style, priority, round, children }: { src: string; frame?: FrameProps; alt: string; sizes: string; className?: string; style?: CSSProperties; priority?: boolean; round?: boolean; children?: ReactNode }) {
  return (
    <div className={`tp-panel relative overflow-hidden ${round ? "rounded-t-full rounded-b-[10px]" : "rounded-[6px]"} ${className}`} style={style}>
      <Image {...frame} src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {children}
    </div>
  );
}

export function Atom({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 60" fill="none" stroke="var(--inv-ink)" strokeWidth="2" className={`absolute ${className}`}>
      <ellipse cx="30" cy="30" rx="28" ry="9" />
      <ellipse cx="30" cy="30" rx="28" ry="9" transform="rotate(60 30 30)" />
      <ellipse cx="30" cy="30" rx="28" ry="9" transform="rotate(-60 30 30)" />
      <circle cx="30" cy="30" r="5" fill="var(--inv-accent)" />
    </svg>
  );
}

const STRIPES = ["var(--inv-accent)", "var(--tp-sun)", "var(--inv-gold)", "var(--inv-card)"];

// Pita gelombang empat warna khas 70-an, merentang selebar wadahnya.
export function Groovy({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 120" preserveAspectRatio="none" className={`absolute ${className}`}>
      {STRIPES.map((c, i) => (
        <path key={c} d={`M0 ${20 + i * 22} C60 ${i * 22} 90 ${50 + i * 22} 150 ${28 + i * 22} C210 ${6 + i * 22} 240 ${52 + i * 22} 300 ${26 + i * 22} L300 120 L0 120 Z`} fill={c} stroke="var(--inv-ink)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// Pelangi lengkung empat warna.
export function Rainbow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 100" className={`absolute ${className}`}>
      {STRIPES.map((c, i) => (
        <path key={c} d={`M${10 + i * 18} 100 A${90 - i * 18} ${90 - i * 18} 0 0 1 ${190 - i * 18} 100 Z`} fill={c} stroke="var(--inv-ink)" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

// Sinar matahari besar yang berpusat tepat di tengah induknya, dipasang di belakang foto supaya fotonya jadi pusat
// sinar. Induk perlu isolate dan wadah luar perlu overflow-hidden.
export function Rays({ tone = "pop", className = "size-[260vmax]" }: { tone?: "pop" | "pop2"; className?: string }) {
  return <span aria-hidden="true" className={`tp-rays pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 ${tone === "pop2" ? "tp-rays-pop2" : ""} ${className}`} />;
}

const bulbs = (n: number, from = 0) => Array.from({ length: n }, (_, i) => <span key={i} className={`tp-bulb ${(i + from) % 2 ? "tp-bulb-alt" : ""}`} />);

// Papan judul bioskop dengan bingkai bohlam utuh di keempat sisi yang menyala bergantian seperti lampu kejar.
export function Marquee({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`tp-marquee relative grid place-items-center ${className}`}>
      <span aria-hidden="true" className="absolute inset-x-2.5 top-1.5 flex justify-between">
        {bulbs(22)}
      </span>
      <span aria-hidden="true" className="absolute inset-x-2.5 bottom-1.5 flex justify-between">
        {bulbs(22)}
      </span>
      <span aria-hidden="true" className="absolute inset-y-6 left-2.5 flex flex-col justify-between">
        {bulbs(3, 1)}
      </span>
      <span aria-hidden="true" className="absolute inset-y-6 right-2.5 flex flex-col justify-between">
        {bulbs(3)}
      </span>
      {children}
    </div>
  );
}

// Label kapsul kecil bergaris tebal.
export function Chip({ children, className = "", tone = "card" }: { children: ReactNode; className?: string; tone?: "card" | "sun" | "pop" }) {
  const bg = { card: "bg-inv-card text-inv-ink", sun: "bg-(--tp-sun) text-inv-ink", pop: "bg-inv-accent text-inv-card" }[tone];
  return <span className={`tp-chip inline-block tp-label ${bg} ${className}`}>{children}</span>;
}

// Judul huruf tebal ala komik: isi berwarna, garis tepi gelap, dan bayangan padat.
export function Title({ children, className = "", as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" | "p" }) {
  return <Tag className={`tp-offset tp-title-pop font-display leading-[1.02] ${className}`}>{children}</Tag>;
}

// Bentuk stiker retro, dibuat dari rumus supaya rapi dan simetris. Koordinat dalam kotak 100 x 100.
const round = (n: number) => Math.round(n * 10) / 10;
function polar(radius: (t: number) => number, steps = 180) {
  const pts = Array.from({ length: steps }, (_, i) => {
    const t = (i / steps) * Math.PI * 2;
    const r = radius(t);
    return `${round(50 + r * Math.cos(t - Math.PI / 2))} ${round(50 + r * Math.sin(t - Math.PI / 2))}`;
  });
  return `M${pts.join("L")}Z`;
}
export const SHAPES = {
  // Lingkaran bergelombang seperti stiker matahari.
  scallop: polar((t) => 44 + 3.6 * Math.cos(14 * t)),
  // Ledakan dengan ujung membulat.
  burst: polar((t) => 41 + 7 * Math.cos(10 * t)),
  // Bunga daisy dengan delapan kelopak bulat.
  daisy: polar((t) => 30 + 16 * Math.abs(Math.cos(4 * t)) ** 0.7),
  // Bunga empat kelopak.
  clover: polar((t) => 26 + 20 * Math.abs(Math.cos(2 * t)) ** 0.6),
  heart: "M50 88 C22 68 8 52 8 34 C8 20 19 10 32 10 C40 10 46 14 50 21 C54 14 60 10 68 10 C81 10 92 20 92 34 C92 52 78 68 50 88 Z",
  star: "M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z",
  pinwheel: Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const b = a + Math.PI / 5;
    return `M50 50L${round(50 + 46 * Math.cos(a))} ${round(50 + 46 * Math.sin(a))}L${round(50 + 46 * Math.cos(b))} ${round(50 + 46 * Math.sin(b))}Z`;
  }).join(""),
  bubble: "M14 18 C14 12 18 8 24 8 L80 8 C86 8 90 12 90 18 L90 58 C90 64 86 68 80 68 L44 68 L28 86 L30 68 L24 68 C18 68 14 64 14 58 Z",
} as const;
export type Shape = keyof typeof SHAPES;

const FILL = { sun: "var(--tp-sun)", pop: "var(--inv-accent)", pop2: "var(--inv-gold)", card: "var(--inv-card)", pink: "color-mix(in srgb, var(--inv-accent) 45%, #fff)", mint: "color-mix(in srgb, var(--inv-gold) 45%, #fff)" } as const;
export type Fill = keyof typeof FILL;

// Gerak bawaan tiap bentuk: kincir dan bunga berputar, bintang berkedip, hati berdetak, sisanya bergoyang.
// Stiker bertulisan tidak ikut berputar supaya tetap terbaca, yang merah atau biru berganti warna bergantian.
const MOTION: Record<Shape, string> = {
  pinwheel: "tp-m-spin",
  daisy: "tp-m-turn",
  star: "tp-m-twinkle",
  heart: "tp-m-beat",
  clover: "tp-m-wiggle",
  scallop: "tp-m-wiggle",
  burst: "tp-m-wiggle",
  bubble: "tp-m-wiggle",
};

// Stiker bergaris tebal dengan bayangan sablon. Teks pendek di tengah bila ada.
export function Sticker({ shape, fill = "sun", className = "", text, textClass = "", center }: { shape: Shape; fill?: Fill; className?: string; text?: ReactNode; textClass?: string; center?: Fill }) {
  return (
    <span aria-hidden="true" className={`tp-stk absolute grid place-items-center ${text ? (fill === "pop" || fill === "pop2" ? "tp-m-hue" : "") : MOTION[shape]} ${className}`}>
      <svg viewBox="-4 -4 112 112" className="absolute inset-0 size-full overflow-visible">
        <path d={SHAPES[shape]} transform="translate(4 4)" fill="var(--inv-ink)" />
        <path d={SHAPES[shape]} style={{ fill: FILL[fill] }} stroke="var(--inv-ink)" strokeWidth="3" strokeLinejoin="round" />
        {(shape === "daisy" || shape === "clover") && <circle cx="50" cy="50" r="13" style={{ fill: FILL[center ?? "sun"] }} stroke="var(--inv-ink)" strokeWidth="3" />}
      </svg>
      {/* Teks dipusatkan pada bentuk berwarna, bukan kotak yang memuat bayangan, ruang kosong huruf dipangkas. */}
      {text && (
        <span className="absolute top-[3.6%] right-[7.1%] bottom-[7.1%] left-[3.6%] grid place-items-center">
          <span className={`text-center leading-[0.95] [text-box:trim-both_cap_alphabetic] ${textClass}`}>{text}</span>
        </span>
      )}
    </span>
  );
}
