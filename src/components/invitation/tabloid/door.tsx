"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { FrameProps } from "@/lib/invitation/frame";
import { doorFit, useDoorFit } from "../door-fit";
import { Panel, Rays, Sticker, Title } from "./pop";

export type TabloidProps = { groom: string; bride: string; date: string; photo: string; frame?: FrameProps; invited: string; onOpen: () => void };

// Pembuka Kabar Retro: sampul tabloid edisi spesial di atas sinar matahari, dengan nama tamu di kolom alamat.
// Saat dibuka, stiker meletup lepas dan sinar berputar, lalu lingkaran iris ala kartun lama terbuka dari tengah foto.
export function TabloidDoor({ groom, bride, date, photo, frame, invited, onOpen }: TabloidProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const reduce = useReducedMotion();
  const cover = useRef<HTMLDivElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useDoorFit(fit, { y: 32, x: 24 });

  function play() {
    if (phase !== "idle") return;
    onOpen();
    const el = cover.current;
    if (reduce || !el) return setPhase("done");
    setPhase("playing");
    el.querySelectorAll<HTMLElement>(".tp-pop").forEach((s, i) =>
      s.animate([{ scale: 1 }, { scale: 1.35, offset: 0.4 }, { scale: 0, opacity: 0 }], { duration: 420, delay: i * 50, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }),
    );
    el.querySelector<HTMLElement>(".tp-rays")?.animate([{ rotate: "0deg" }, { rotate: "75deg" }], { duration: 1500, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    const panel = el.querySelector(".tp-panel");
    panel?.animate([{ scale: 1 }, { scale: 1.05 }, { scale: 1 }], { duration: 450, easing: "ease-out" });

    const box = panel?.getBoundingClientRect();
    const cx = box ? box.left + box.width / 2 : innerWidth / 2;
    const cy = box ? box.top + box.height / 2 : innerHeight / 2;
    const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 24;
    const start = performance.now() + 500;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / 900));
      const r = (k < 0.5 ? 4 * k ** 3 : 1 - (2 - 2 * k) ** 3 / 2) * far;
      const mask = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${r}px, #000 ${r + 1}px)`;
      el.style.setProperty("mask-image", mask);
      el.style.setProperty("-webkit-mask-image", mask);
      if (ring.current) Object.assign(ring.current.style, { display: r > 1 ? "block" : "none", left: `${cx}px`, top: `${cy}px`, width: `${2 * r + 16}px`, height: `${2 * r + 16}px` });
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else setPhase("done");
    };
    raf.current = requestAnimationFrame(tick);
  }

  if (phase === "done") return null;

  return (
    <div className={`tp-door fixed inset-0 z-50 overflow-hidden ${phase === "playing" ? "pointer-events-none" : ""}`}>
      <div ref={cover} className="tp-sunburst absolute inset-0">
        <div aria-hidden="true" className="tp-stripe absolute inset-x-0 top-0 h-3" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={fit} {...doorFit({ y: 32, x: 24 })} className="relative w-[min(92vw,400px)] px-1 pt-4 pb-6 md:w-[min(84vw,640px)]">
            <div className="relative z-10 flex items-center justify-between">
              <span className="tp-chip tp-label bg-inv-card text-inv-ink">Kabar Retro · No. 27</span>
              <span className="tp-chip tp-label bg-(--tp-sun) text-inv-ink">Edisi spesial</span>
            </div>
            <Title as="h1" className="relative z-10 mt-4 text-[clamp(40px,12vw,54px)] text-inv-card md:text-[68px]">
              Kami
              <br />
              <span className="text-(--tp-sun)">Menikah!</span>
            </Title>
            <div className="relative isolate mt-4">
              <Rays />
              <Panel src={photo} frame={frame} alt={`${groom} dan ${bride}`} sizes="(min-width: 768px) 640px, 92vw" priority className="mx-auto aspect-[4/3] -rotate-2" />
              <Sticker shape="burst" fill="pop" className="tp-pop -top-10 -right-10 md:-right-26 md:-top-22 size-32 md:size-48 rotate-12" text="Edisi spesial" textClass="tp-label w-14 text-[18px] md:text-[28px] text-inv-card" />
              <Sticker shape="heart" fill="pink" className="tp-pop bottom-2 left-0 size-14 -rotate-12" />
              <Sticker shape="daisy" fill="card" className="tp-pop -bottom-2 right-6 size-12 rotate-12" />
              <Sticker shape="star" fill="sun" className="tp-pop top-6 left-1 size-9" />
              <Sticker shape="star" fill="card" className="tp-pop -top-5 left-1/3 size-5" />
              <Sticker shape="pinwheel" fill="sun" className="tp-pop -right-4 bottom-1/3 size-10 md:size-14" />
            </div>
            <p className="relative z-10 -rotate-2 -mt-3 text-center">
              <span className="tp-chip tp-label bg-inv-card md:text-[22px]! text-inv-ink">
                {groom} &amp; {bride} · {date}
              </span>
            </p>
            {invited && (
              <div className="tp-torn relative z-10 mt-4 bg-inv-card px-4 pt-4 pb-3">
                <p className="tp-label text-[13px] text-inv-accent">Kepada Yth.</p>
                <p className="tp-type mt-1 text-[18px] text-inv-ink">{invited}</p>
              </div>
            )}
            <div className="relative z-10 mt-6 text-center">
              <button type="button" onClick={play} className="tp-pill tp-label text-[18px]">
                Buka undangan ★
              </button>
            </div>
          </div>
        </div>
      </div>
      <div ref={ring} aria-hidden="true" className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-8 border-inv-ink shadow-[0_0_0_7px_var(--tp-sun)]" />
      {phase === "playing" && (
        <button type="button" onClick={() => setPhase("done")} className="pointer-events-auto absolute right-4 bottom-4 z-10 rounded-full border-2 border-inv-ink bg-inv-card px-4 py-2 text-[13px] text-inv-ink">
          Lewati
        </button>
      )}
    </div>
  );
}
