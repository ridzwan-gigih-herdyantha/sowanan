"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { litPath } from "./moon";
import { MoonFace } from "./moon-disc";

const FROM = 0.06;

// Satu bulan yang menempel di kiri atas sejak bagian pertama almanak sampai akhir undangan. Fasenya mengikuti posisi
// gulir: dari sabit muda di awal sampai bulan malam pernikahan di akhir, dan berkurang lagi saat digulir ke atas.
// Fase mengejar posisi gulir dengan lerp, jadi perubahannya halus walau gulirnya tersendat.
export function ScrollMoon({ age }: { age: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const lit = el?.querySelector("[data-moon-lit]");
    if (!el || !lit) return;
    const start = () => document.querySelector<HTMLElement>("[data-rb-folio]");
    let current = -1;
    let shown = 0;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const first = start();
      const doc = document.documentElement;
      const begin = first ? first.getBoundingClientRect().top + scrollY - innerHeight * 0.35 : 0;
      const end = doc.scrollHeight - innerHeight;
      const progress = Math.min(1, Math.max(0, (scrollY - begin) / Math.max(1, end - begin)));
      const target = FROM + (age - FROM) * progress;
      const visible = first !== null && scrollY >= begin ? 1 : 0;
      const k = reduce ? 1 : 1 - Math.exp(-8 * dt);
      current = current < 0 ? target : current + (target - current) * k;
      shown += (visible - shown) * (reduce ? 1 : 1 - Math.exp(-6 * dt));
      lit.setAttribute("d", litPath(current, 50));
      el.style.opacity = shown.toFixed(3);
      el.style.transform = `translateY(${((1 - shown) * -12).toFixed(2)}px)`;
      el.style.visibility = shown < 0.01 ? "hidden" : "";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [age, reduce]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-4 left-4 z-30 size-9 opacity-0 sm:top-8 sm:left-8 sm:size-12 lg:top-12 lg:left-[max(32px,calc((100vw-1160px)/2+32px))] lg:size-14"
      style={{ visibility: "hidden" }}
    >
      <svg viewBox="-58 -58 116 116" className="size-full overflow-visible drop-shadow-[0_0_10px_color-mix(in_srgb,var(--inv-accent)_35%,transparent)]">
        <MoonFace id="rb-scroll" d={litPath(FROM, 50)} small />
      </svg>
    </div>
  );
}
