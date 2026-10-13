"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { litPath } from "./moon";
import { MoonFace, MoonHalo } from "./moon-disc";
import { Starfield } from "./sky";

export type BulanProps = { groom: string; bride: string; date: string; place: string; moon: string; age: number; invited: string; onOpen: () => void };

const START = 0.08;

// Kurva gerak berdurasi tetap: mulai pelan, cepat di tengah, berhenti pelan tepat di akhir.
const ease = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const span = (t: number, from: number, length: number) => ease(Math.min(1, Math.max(0, (t - from) / length)));

// Waktu dalam detik. Bulan naik dan membesar ke tempatnya di hero, bukit dan teks tenggelam, lalu langit pembuka
// larut ke langit hero yang warnanya sama. Tidak ada cahaya yang memenuhi layar.
const TEXT = [0, 0.5] as const;
const RISE = [0.1, 1.7] as const;
const HILLS = [0.15, 1.2] as const;
const SKY = [0.95, 0.85] as const;
// Bulan terbang memudar dan bulan hero muncul di tempat yang sama, jadi bulan seolah mundur ke balik foto.
const SWAP = [1.45, 0.4] as const;
const END = 1.85;

// Pembuka Rembulan: bulan sabit baru terbit di atas bukit. Saat dibuka, bulan naik, membesar, dan berganti fase
// sampai bulan malam pernikahan, lalu berhenti tepat di posisi bulan pada hero.
export function BulanDoor({ groom, bride, date, place, moon, age, invited, onOpen }: BulanProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const stars = useRef<HTMLDivElement>(null);
  const hills = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const path = useRef({ dx: 0, dy: 0, scale: 1 });
  const target = useRef<HTMLElement | null>(null);

  // Bulan di hero disembunyikan selama perpindahan, supaya tidak ada dua bulan di layar.
  useEffect(() => () => {
    if (target.current) target.current.style.opacity = "";
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const texts = Array.from(root.current?.querySelectorAll<HTMLElement>(".rb-text") ?? []);
    const lit = disc.current?.querySelector("[data-moon-lit]");
    const halo = disc.current?.querySelector("[data-moon-halo]");
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const text = span(t, ...TEXT);
      const rise = span(t, ...RISE);
      const sink = span(t, ...HILLS);
      const fade = span(t, ...SKY);
      const { dx, dy, scale } = path.current;

      for (const el of texts) {
        el.style.opacity = String(1 - text);
        el.style.transform = `translateY(${text * 18}px)`;
      }
      // Bulan menempuh lengkung ringan: naik lebih dulu, baru bergeser ke samping, seperti benda langit yang terbit.
      const across = span(t, RISE[0] + 0.2, RISE[1] - 0.2);
      if (disc.current) disc.current.style.transform = `translate3d(${dx * across}px, ${dy * rise}px, 0) scale(${1 + (scale - 1) * rise})`;
      lit?.setAttribute("d", litPath(START + (age - START) * rise, 50));
      // Halo berakhir sama dengan halo bulan di hero, yang terangnya mengikuti fase.
      halo?.setAttribute("opacity", String(0.52 + (0.2 + 0.8 * Math.sin(Math.PI * age) - 0.52) * rise));
      if (hills.current) {
        hills.current.style.transform = `translateY(${sink * 60}%)`;
        hills.current.style.opacity = String(1 - sink);
      }
      // Kamera seolah menengadah: bintang ikut turun pelan, lalu langit pembuka larut ke hero.
      if (stars.current) {
        stars.current.style.transform = `translateY(${rise * 70}px)`;
        stars.current.style.opacity = String(1 - fade);
      }
      if (sky.current) sky.current.style.opacity = String(1 - fade);
      const swap = span(t, ...SWAP);
      if (disc.current) disc.current.style.opacity = String(1 - swap);
      if (target.current) target.current.style.opacity = String(swap);

      if (t >= END) {
        if (target.current) target.current.style.opacity = "";
        setPhase("done");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, age]);

  function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return setPhase("done");
    // Tujuan dibaca dari bulan di hero setelah halaman kembali ke atas.
    requestAnimationFrame(() => {
      const from = disc.current?.getBoundingClientRect();
      target.current = document.querySelector<HTMLElement>("[data-rb-target=moon]");
      const to = target.current?.getBoundingClientRect();
      if (from && to) path.current = { dx: to.left - from.left, dy: to.top - from.top, scale: to.width / from.width };
      if (target.current) target.current.style.opacity = "0";
      if (disc.current) disc.current.style.transformOrigin = "0 0";
      setPhase("playing");
    });
  }

  if (phase === "done") return null;

  return (
    <div ref={root} className="rb-door fixed inset-0 z-50 overflow-hidden">
      <div ref={sky} aria-hidden="true" className="absolute inset-0 will-change-[opacity]" style={{ background: "var(--rb-sky)" }} />
      <div ref={stars} aria-hidden="true" className="absolute inset-x-0 -inset-y-24 will-change-transform">
        <Starfield meteors seed={11} still={phase === "playing"} />
      </div>

      {/* Bukit berlapis di cakrawala, lapisan depan lebih gelap. */}
      <div ref={hills} aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[34%] will-change-transform">
        <div className="absolute inset-x-0 bottom-[12%] h-24 bg-[radial-gradient(60%_100%_at_50%_100%,color-mix(in_srgb,var(--inv-accent)_14%,transparent),transparent)]" />
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <path d="M0 150 C 180 95 330 120 480 105 S 800 60 980 110 S 1140 130 1200 120 V300 H0Z" style={{ fill: "color-mix(in srgb, var(--inv-night) 55%, var(--inv-paper))" }} />
          <path d="M0 215 C 200 160 360 205 560 180 S 900 150 1060 190 S 1170 200 1200 196 V300 H0Z" style={{ fill: "var(--inv-night)" }} />
        </svg>
      </div>

      <div className="absolute inset-0 flex flex-col items-center px-6 pt-[max(56px,11vh)] text-center">
        <p className="rb-text rb-label text-[11px] tracking-[0.34em] text-inv-gold">Undangan Pernikahan</p>
        <h1 className="rb-text mt-4 font-display text-[clamp(46px,12vw,92px)] leading-[0.95] text-inv-ink">
          {groom}
          <span className="mx-3 font-body text-[0.42em] text-inv-gold italic">&amp;</span>
          {bride}
        </h1>
        <p className="rb-text rb-label mt-5 text-[12px] tracking-[0.24em] text-inv-ink/85">{date}</p>
        <p className="rb-text mt-1.5 font-body text-[15px] text-inv-ink/65 italic">{place}</p>
        {invited && (
          <p className="rb-text mt-6 font-body text-[15px] text-inv-ink/70">
            Kepada <span className="font-display text-[22px] text-inv-accent">{invited}</span>
          </p>
        )}
        <button
          type="button"
          onClick={play}
          className="rb-text rb-label mt-8 rounded-full border border-inv-gold/70 px-8 py-3 text-[12px] tracking-[0.3em] text-inv-ink transition-[background-color,border-color] duration-300 hover:border-inv-accent hover:bg-inv-accent/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inv-accent"
        >
          Buka undangan
        </button>
      </div>

      {/* Bulan sabit baru terbit, sedikit di atas bukit. */}
      <div className="absolute inset-x-0 bottom-[22%] flex justify-center">
        {/* Tanpa will-change, supaya bulan digambar ulang tajam di setiap ukuran saat membesar. */}
        <div ref={disc} className="relative size-28 sm:size-32">
          <svg viewBox="-58 -58 116 116" aria-hidden="true" className="size-full overflow-visible">
            <MoonHalo id="rb-door" light={0.4} />
            <MoonFace id="rb-door" d={litPath(START, 50)} />
          </svg>
        </div>
      </div>
      <p className="rb-text pointer-events-none absolute inset-x-0 bottom-[max(20px,4vh)] text-center font-body text-[13px] text-inv-gold italic">{moon}</p>

      {phase === "playing" && (
        <button type="button" onClick={() => setPhase("done")} className="rb-label absolute right-4 bottom-4 z-10 rounded-full border border-inv-line px-4 py-2 text-[12px] tracking-[0.18em] text-inv-ink/80">
          Lewati
        </button>
      )}
    </div>
  );
}
