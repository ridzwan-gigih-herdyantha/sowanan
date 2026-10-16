"use client";

import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { doorFit, useDoorFit } from "../door-fit";
import { Corner } from "./ornaments";

export type MedaliProps = { groom: string; bride: string; monogram: string; date: string; place: string; invited: string; onOpen: () => void };

const EASE = [0.22, 0.61, 0.36, 1] as const;
const GROW = [0.65, 0, 0.25, 1] as const;

// Lubang lingkaran pada lapisan pembuka, dengan dua cincin emas yang ikut melebar di tepinya.
// Semuanya dibaca dari variabel --r, --cx, dan --cy supaya cukup satu nilai yang dianimasikan.
const HOLE = "radial-gradient(circle at var(--cx) var(--cy), transparent var(--r), #000 calc(var(--r) + 0.5px))";
const RINGS: CSSProperties = {
  background: `radial-gradient(circle at var(--cx) var(--cy), transparent calc(var(--r) - 0.5px), var(--inv-gold) var(--r), var(--inv-gold) calc(var(--r) + 1px), transparent calc(var(--r) + 1.5px), transparent calc(var(--r) + 6.5px), var(--inv-gold-light) calc(var(--r) + 7px), var(--inv-gold-light) calc(var(--r) + 8px), transparent calc(var(--r) + 8.5px))`,
};

// Persegi dengan sudut berundak ke dalam, ciri bingkai Art Deco.
const stepped = (x0: number, y0: number, x1: number, y1: number, c: number) =>
  `M${x0 + c} ${y0}H${x1 - c}V${y0 + c}H${x1}V${y1 - c}H${x1 - c}V${y1}H${x0 + c}V${y1 - c}H${x0}V${y0 + c}H${x0 + c}Z`;
const diamond = (x: number, y: number, r: number) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`;

// Gradasi emas metalik. Titik tergelap dicampur warna aksen supaya garis tetap terbaca di atas kertas gading.
const DEEP = "color-mix(in srgb, var(--inv-gold) 55%, var(--inv-accent))";
const GOLD = [
  [0, DEEP],
  [0.25, "var(--inv-gold)"],
  [0.45, "var(--inv-gold-light)"],
  [0.6, "var(--inv-gold)"],
  [0.8, "var(--inv-gold-light)"],
  [1, DEEP],
] as const;

// Bingkai digambar dalam ukuran piksel layar, jadi garisnya tetap tipis dan sudutnya tidak melar.
function DecoFrame({ w, h, draw }: { w: number; h: number; draw: boolean }) {
  const small = w < 640;
  const m = small ? 12 : 24;
  const c = small ? 22 : 34;
  const [x0, y0, x1, y1] = [m, m, w - m, h - m];
  const quarters = [
    [x0, y0, 1, 1],
    [x1, y0, -1, 1],
    [x0, y1, 1, -1],
    [x1, y1, -1, -1],
  ];
  const lines = [
    { d: stepped(x0, y0, x1, y1, c), width: 2 },
    { d: stepped(x0 + 5, y0 + 5, x1 - 5, y1 - 5, c), width: 0.75 },
    { d: stepped(x0 + 10, y0 + 10, x1 - 10, y1 - 10, c), width: 1.2 },
  ];
  const knots = [y0 + 5, y1 - 5];
  const gems = [
    [x0 + 5, h / 2],
    [x1 - 5, h / 2],
  ];

  return (
    <svg aria-hidden="true" className="su-frame pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="su-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2={h}>
          {GOLD.map(([o, color]) => (
            <stop key={o} offset={o} style={{ stopColor: color }} />
          ))}
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#su-gold)">
        {lines.map((l, n) => (
          <motion.path
            key={n}
            d={l.d}
            strokeWidth={l.width}
            initial={draw ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
          />
        ))}
      </g>
      {/* Simpul belah ketupat ganda di tengah atas dan bawah, permata di tengah sisi, dan titik di relung sudut.
          Isinya warna kertas supaya menutup garis di belakangnya. */}
      <motion.g initial={draw ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}>
        {knots.map((y) => (
          <g key={y}>
            <rect x={w / 2 - 46} y={y - 15} width="92" height="30" fill="var(--inv-paper)" />
            <path d={`M${w / 2 - 70} ${y}H${w / 2 - 50}M${w / 2 + 50} ${y}H${w / 2 + 70}`} stroke="url(#su-gold)" strokeWidth="1.2" />
            <path d={`M${w / 2 - 48} ${y}L${w / 2 - 18} ${y - 13}L${w / 2 + 12} ${y}L${w / 2 - 18} ${y + 13}Z`} fill="none" stroke="url(#su-gold)" strokeWidth="1.2" />
            <path d={`M${w / 2 + 48} ${y}L${w / 2 + 18} ${y - 13}L${w / 2 - 12} ${y}L${w / 2 + 18} ${y + 13}Z`} fill="none" stroke="url(#su-gold)" strokeWidth="1.2" />
            <path d={diamond(w / 2, y, 4)} fill="url(#su-gold)" />
          </g>
        ))}
        {gems.map(([x, y]) => (
          <g key={x}>
            <path d={diamond(x, y, 14)} fill="var(--inv-paper)" />
            <path d={diamond(x, y, 9)} fill="var(--inv-paper)" stroke="url(#su-gold)" strokeWidth="1" />
            <path d={diamond(x, y, 3.5)} fill="url(#su-gold)" />
          </g>
        ))}
        {quarters.map(([x, y, sx, sy]) => (
          <path key={`${x}-${y}`} d={diamond(x + (c / 2) * sx, y + (c / 2) * sy, 3.5)} fill="url(#su-gold)" />
        ))}
      </motion.g>
    </svg>
  );
}

// Pembuka Sutra: bingkai Art Deco emas dengan medali monogram. Saat dibuka, bingkai melebar dan memudar,
// lalu cincin medali meluas seperti riak sampai keluar layar dan undangan terlihat dari dalamnya.
export function MedaliDoor({ groom, bride, monogram, date, place, invited, onOpen }: MedaliProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const skipped = useRef(false);
  const fit = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useDoorFit(fit, { y: 170, ySm: 120 });

  // Ukuran layar untuk bingkai hiasan.
  useLayoutEffect(() => {
    const measure = () => setBox({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const finish = () => {
    skipped.current = true;
    setPhase("done");
  };

  async function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return finish();
    setPhase("playing");
    const gone = () => skipped.current || !scope.current;

    animate(".su-frame", { opacity: 0, scale: 1.05 }, { duration: 0.7, ease: EASE });
    await animate(".su-text", { opacity: 0, y: -6 }, { duration: 0.45, ease: EASE });
    if (gone()) return;

    // Cincin medali diganti cincin gradasi di posisi yang sama, lalu hanya jari-jarinya yang dianimasikan.
    // Garis tepi medali 1px berada di sisi dalam kotaknya, jadi lubang dimulai 1px lebih kecil.
    const root = scope.current as HTMLElement;
    const r = root.querySelector(".su-medal")!.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const from = r.width / 2 - 1;
    const to = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 12;
    root.style.setProperty("--cx", `${cx}px`);
    root.style.setProperty("--cy", `${cy}px`);
    root.style.setProperty("--r", `${from}px`);
    root.style.setProperty("mask-image", HOLE);
    root.style.setProperty("-webkit-mask-image", HOLE);
    animate(".su-rings", { opacity: 1 }, { duration: 0 });
    animate(".su-medal", { opacity: 0 }, { duration: 0 });

    await animate(root, { "--r": [`${from}px`, `${to}px`] }, { duration: 1.4, ease: GROW });
    if (!skipped.current) setPhase("done");
  }

  if (phase === "done") return null;

  return (
    <div ref={scope} className="su-door inv-paper fixed inset-0 z-50 overflow-hidden">
      {box && <DecoFrame w={box.w} h={box.h} draw={!reduce} />}
      {/* Ulir sudut yang sama dengan bingkai kartu di dalam undangan. */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="pointer-events-none absolute inset-7.5 sm:inset-11.5"
      >
        <div className="su-frame absolute inset-0">
          {(["tl", "tr", "bl", "br"] as const).map((at) => (
            <Corner key={at} at={at} size="size-20 sm:size-28" className="text-inv-gold" />
          ))}
        </div>
      </motion.div>
      <div aria-hidden="true" className="su-rings pointer-events-none absolute inset-0 opacity-0" style={RINGS} />
      <div className="absolute inset-0 flex items-center justify-center px-12">
        <div ref={fit} {...doorFit({ y: 170, ySm: 120 })} className="flex w-[min(80vw,400px)] flex-col items-center text-center">
          {/* Cincin luar berjarak 7px, sama dengan cincin gradasi, supaya pergantiannya tidak terlihat. */}
          <div className="su-medal relative size-32 rounded-full border border-inv-gold sm:size-36">
            <div className="absolute -inset-1.75 rounded-full border border-inv-gold-light" />
            <div className="su-text absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[30px] leading-none tracking-[0.08em] text-inv-accent sm:text-[34px]">{monogram.replace(/\s/g, "")}</span>
              <span className="mt-3 h-px w-8 bg-inv-gold" />
            </div>
          </div>

          <p className="su-text mt-9 font-display text-[11px] tracking-[0.4em] text-inv-gold uppercase">Undangan Pernikahan</p>
          <p className="su-text mt-3 font-script text-[clamp(38px,11vw,58px)] leading-[1.1] text-inv-accent">
            {groom}
            <span className="mx-2 font-display text-[0.42em] text-inv-gold italic">&amp;</span>
            {bride}
          </p>
          <div aria-hidden="true" className="su-text mt-4 flex items-center gap-2 text-inv-gold">
            <span className="h-px w-14 bg-linear-to-r from-transparent to-current" />
            <span className="size-1 rotate-45 bg-current" />
            <span className="size-2 rotate-45 border border-current" />
            <span className="size-1 rotate-45 bg-current" />
            <span className="h-px w-14 bg-linear-to-l from-transparent to-current" />
          </div>
          <p className="su-text mt-4 font-display text-[12px] tracking-[0.28em] uppercase">{date}</p>
          <p className="su-text mt-1 text-[14px] text-inv-ink/70 italic">{place}</p>

          {invited && (
            <div className="su-text mt-7">
              <p className="text-[13px] text-inv-ink/60">Kepada Yth.</p>
              <p className="mt-1 font-display text-[22px] leading-tight text-inv-accent">{invited}</p>
            </div>
          )}
          <button
            type="button"
            onClick={play}
            className="su-text mt-8 border border-inv-gold px-9 py-3 font-display text-[11px] tracking-[0.32em] text-inv-accent uppercase outline-1 outline-offset-3 outline-inv-gold/50 outline-solid transition-colors duration-200 hover:bg-inv-accent hover:text-inv-card"
          >
            Buka undangan
          </button>
        </div>
      </div>

      {phase === "playing" && (
        <button type="button" onClick={finish} className="absolute right-4 bottom-4 z-10 border border-inv-line bg-inv-card px-4 py-2 text-[13px] text-inv-ink">
          Lewati
        </button>
      )}
    </div>
  );
}
