"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { illumination, litPath } from "./moon";
import { MoonFace, MoonHalo } from "./moon-disc";
import { Starfield } from "./sky";

export type BulanProps = { groom: string; bride: string; date: string; place: string; moon: string; invited: string; onOpen: () => void };

const START = 0.07;
const FULL = 0.5;

// Lerp yang tidak bergantung pada kecepatan layar: rate besar berarti cepat sampai, gerakannya selalu melambat di ujung.
const approach = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

// Lerp bertingkat: nilai mengejar pengejar yang mengejar target. Hasilnya mulai pelan dan berakhir pelan,
// tanpa sentakan di awal seperti lerp tunggal.
type Glide = { at: number; lead: number };
const glide = (g: Glide, to: number, rate: number, dt: number) => {
  g.lead = approach(g.lead, to, rate, dt);
  g.at = approach(g.at, g.lead, rate, dt);
  return g.at;
};
const still = (n: number): Glide => ({ at: n, lead: n });

// Pembuka Rembulan: bulan sabit di langit malam. Saat dibuka, teks memudar, bulan membesar sampai purnama,
// cahayanya merekah memenuhi layar, lalu lapisan pembuka memudar ke undangan.
export function BulanDoor({ groom, bride, date, place, moon, invited, onOpen }: BulanProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const bloom = useRef<HTMLDivElement>(null);
  const wash = useRef<HTMLDivElement>(null);
  const started = useRef<number | null>(null);
  const [scale, setScale] = useState(1);

  // Isi diperkecil bila lebih tinggi dari layar, supaya tamu tidak perlu menggulir untuk membuka undangan.
  useEffect(() => {
    const el = fit.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, (window.innerHeight - 40) / el.offsetHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Satu loop untuk semua gerak: bulan bernapas pelan selama menunggu, lalu urutan pembukaan setelah tombol ditekan.
  useEffect(() => {
    if (phase === "done") return;
    const g = { text: still(1), age: still(START), lift: still(0), bloom: still(0), fade: still(1) };
    const v = { text: 1, age: START, lift: 0, bloom: 0, fade: 1 };
    let last = performance.now();
    let raf = 0;
    const texts = root.current ? Array.from(root.current.querySelectorAll<HTMLElement>(".rb-text")) : [];
    const lit = disc.current?.querySelector("[data-moon-lit]");
    const halo = disc.current?.querySelector("[data-moon-halo]");

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = started.current === null ? -1 : (now - started.current) / 1000;
      const playing = t >= 0;

      // Urutan: teks memudar, bulan membesar sampai purnama, cahaya merekah, lalu seluruh lapisan memudar.
      v.text = glide(g.text, playing ? 0 : 1, 9, dt);
      v.age = glide(g.age, playing && t > 0.15 ? FULL : START, 4.6, dt);
      v.lift = glide(g.lift, playing ? 1 : 0, 3.2, dt);
      v.bloom = glide(g.bloom, playing && t > 0.85 ? 1 : 0, 4.4, dt);
      v.fade = glide(g.fade, playing && t > 1.55 ? 0 : 1, 5.2, dt);

      for (const el of texts) {
        el.style.opacity = String(v.text);
        el.style.transform = `translateY(${(1 - v.text) * -10}px)`;
      }
      const light = illumination(v.age);
      const breathe = reduce ? 0 : Math.sin(now / 1400) * 0.5 + 0.5;
      lit?.setAttribute("d", litPath(v.age, 50));
      halo?.setAttribute("opacity", String(0.2 + light * 0.65 + breathe * 0.15));
      if (disc.current) {
        disc.current.style.transform = `translateY(${(reduce ? 0 : Math.sin(now / 2200) * 4) * (1 - v.lift)}px) scale(${1 + v.lift * 0.12})`;
        // Saat cahaya merekah, bulan ikut bersinar lalu larut ke dalam cahayanya sendiri.
        disc.current.style.filter = v.bloom > 0.001 ? `brightness(${1 + v.bloom * 1.6})` : "";
        disc.current.style.opacity = String(1 - v.bloom * 0.92);
      }
      if (bloom.current) {
        bloom.current.style.opacity = String(Math.min(1, v.bloom * 1.3));
        bloom.current.style.transform = `translate(-50%, -50%) scale(${0.15 + v.bloom * 18})`;
      }
      // Cahaya bulan membasuh seluruh layar sampai terang, lalu ikut memudar bersama lapisan pembuka.
      if (wash.current) wash.current.style.opacity = String(Math.min(1, v.bloom * 1.15));
      if (root.current) root.current.style.opacity = String(v.fade);

      // Di bawah 3% lapisan sudah tidak terlihat, jadi pembuka ditutup tanpa menunggu ekor lerp yang panjang.
      if (playing && v.fade < 0.03) {
        setPhase("done");
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduce]);

  const finish = () => setPhase("done");

  function play() {
    if (phase !== "idle") return;
    onOpen();
    if (reduce) return finish();
    started.current = performance.now();
    setPhase("playing");
  }

  if (phase === "done") return null;

  return (
    <div
      ref={root}
      className="rb-door fixed inset-0 z-50 overflow-hidden will-change-[opacity]"
      style={{ background: "radial-gradient(120% 80% at 50% 30%, color-mix(in srgb, var(--inv-wash) 93%, var(--inv-accent)) 0%, var(--inv-paper) 55%, var(--inv-night) 100%)" }}
    >
      {/* Selama animasi buka, bintang berhenti digambar ulang supaya semua tenaga dipakai untuk bulan dan cahayanya. */}
      <Starfield meteors seed={11} still={phase === "playing"} />
      <div ref={wash} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 will-change-[opacity]" style={{ background: "radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--inv-accent) 60%, #fff), var(--inv-accent) 70%)" }} />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div ref={fit} style={{ transform: `scale(${scale})` }} className="flex w-[min(86vw,420px)] flex-col items-center text-center">
          <div className="relative">
            {/* Cahaya bulan yang merekah, berpusat di bulan. */}
            <div
              ref={bloom}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-48 rounded-full opacity-0 will-change-[transform,opacity]"
              style={{ background: "radial-gradient(circle, #fff 0%, color-mix(in srgb, var(--inv-accent) 70%, #fff) 18%, var(--inv-accent) 36%, color-mix(in srgb, var(--inv-accent) 55%, transparent) 54%, transparent 72%)", transform: "translate(-50%, -50%) scale(.15)" }}
            />
            <div ref={disc} className="relative size-36 will-change-[transform,opacity,filter] sm:size-40">
              <svg viewBox="-58 -58 116 116" aria-hidden="true" className="size-full overflow-visible">
                <MoonHalo id="rb-door" light={0.3} />
                <MoonFace id="rb-door" d={litPath(START, 50)} />
              </svg>
            </div>
          </div>

          <p className="rb-text rb-label mt-10 text-[11px] tracking-[0.34em] text-inv-gold">Undangan Pernikahan</p>
          <h1 className="rb-text mt-4 font-display text-[clamp(46px,13vw,68px)] leading-[0.95] text-inv-ink">
            {groom}
            <span className="my-1 block font-body text-[0.42em] text-inv-gold italic">&amp;</span>
            {bride}
          </h1>
          <div aria-hidden="true" className="rb-text mt-6 flex items-center gap-3 text-inv-gold">
            <span className="h-px w-12 bg-linear-to-r from-transparent to-current" />
            <span className="size-1.5 rounded-full bg-current" />
            <span className="h-px w-12 bg-linear-to-l from-transparent to-current" />
          </div>
          <p className="rb-text rb-label mt-5 text-[12px] tracking-[0.24em] text-inv-ink/85">{date}</p>
          <p className="rb-text mt-1.5 font-body text-[15px] text-inv-ink/65 italic">{place}</p>
          <p className="rb-text mt-1 font-body text-[13px] text-inv-gold italic">{moon}</p>

          {invited && (
            <div className="rb-text mt-8">
              <p className="font-body text-[13px] text-inv-ink/55">Kepada Yth.</p>
              <p className="mt-1 font-display text-[26px] leading-tight text-inv-accent">{invited}</p>
            </div>
          )}
          <button
            type="button"
            onClick={play}
            className="rb-text rb-label mt-9 rounded-full border border-inv-gold/70 px-8 py-3 text-[12px] tracking-[0.3em] text-inv-ink transition-[background-color,border-color] duration-300 hover:border-inv-accent hover:bg-inv-accent/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inv-accent"
          >
            Buka undangan
          </button>
        </div>
      </div>

      {phase === "playing" && (
        <button type="button" onClick={finish} className="rb-label absolute right-4 bottom-4 z-10 rounded-full border border-inv-line px-4 py-2 text-[12px] tracking-[0.18em] text-inv-ink/80">
          Lewati
        </button>
      )}
    </div>
  );
}
