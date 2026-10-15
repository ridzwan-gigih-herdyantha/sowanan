"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { floraSrc } from "./flora";

// Kolibri yang selalu ada di layar: melesat ke satu titik, melayang sebentar sambil mengepak cepat, lalu melesat
// lagi. Titik tujuannya lebih sering di tepi kiri dan kanan supaya tidak menutupi teks. Gambarnya sudah diwarnai
// per set bunga palet.
export function Hummingbird({ set }: { set: string }) {
  const el = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const bird = el.current;
    if (!bird || reduce) return;
    let raf = 0;
    let x = window.innerWidth * 0.82;
    let y = window.innerHeight * 0.3;
    let from = { x, y };
    let to = { x, y };
    let start = performance.now();
    let flight = 0;
    let hover = 1500;
    let face = -1;

    // Titik berikutnya: tujuh dari sepuluh kali di pita tepi kiri atau kanan, sisanya di mana saja.
    const pick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const edge = Math.random() < 0.7;
      const side = Math.random() < 0.5;
      const nx = edge ? (side ? 0.04 + Math.random() * 0.16 : 0.8 + Math.random() * 0.16) * w : (0.1 + Math.random() * 0.8) * w;
      return { x: nx, y: (0.12 + Math.random() * 0.7) * h };
    };
    const next = (now: number) => {
      from = { x, y };
      to = pick();
      const d = Math.hypot(to.x - from.x, to.y - from.y);
      flight = Math.min(2200, 500 + d * 1.6);
      hover = 1200 + Math.random() * 2600;
      if (Math.abs(to.x - from.x) > 8) face = to.x > from.x ? 1 : -1;
      start = now;
    };

    const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
    const tick = (now: number) => {
      const t = now - start;
      if (t < flight) {
        // Lintasan sedikit melengkung ke atas, seperti burung yang menukik lalu naik.
        const k = ease(t / flight);
        x = from.x + (to.x - from.x) * k;
        y = from.y + (to.y - from.y) * k - Math.sin(Math.PI * k) * 40;
      } else if (t < flight + hover) {
        const s = (t - flight) / 1000;
        x = to.x + Math.sin(s * 2.1) * 4;
        y = to.y + Math.sin(s * 3.3) * 6;
      } else next(now);
      bird.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scaleX(${-face})`;
      raf = requestAnimationFrame(tick);
    };

    const visibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        start = performance.now() - flight - hover;
        raf = requestAnimationFrame(tick);
      }
    };
    next(performance.now());
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    // Gambar kolibri menghadap kiri, jadi dibalik saat terbang ke kanan. Animasinya sudah ada di berkas WebP.
    <div ref={el} aria-hidden="true" className="mm-bird pointer-events-none fixed top-0 left-0 z-40 -mt-12 -ml-12 w-[96px] sm:w-[116px]" style={{ transform: "translate3d(-200px, -200px, 0)" }}>
      <Image src={floraSrc(set, "kolibri")} alt="" width={200} height={200} unoptimized className="block h-auto w-full" />
    </div>
  );
}
