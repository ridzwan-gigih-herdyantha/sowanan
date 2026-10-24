"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { floraSrc } from "./flora";

type Spot = { x: number; y: number; roaming: boolean };
// Menjadi true setelah sepasang kolibri bertemu pertama kali. Sejak itu kolibri kecil terbang menemani yang besar.
type Pair = { together: boolean };

// Kolibri melesat dan melayang bergantian, lebih sering di tepi supaya teks tidak tertutup. Saat diketuk kabur,
// lalu datang dari sisi lain, membesar sebentar, dan pergi. Posisi ditulis ke spot untuk dibaca pasangannya.
function Bird({ set, spot, small, leader, pair }: { set: string; spot: Spot; small?: boolean; leader?: Spot; pair: Pair }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bird = el.current;
    if (!bird) return;
    let raf = 0;
    let x = window.innerWidth * (small ? 0.18 : 0.82);
    let y = window.innerHeight * (small ? 0.6 : 0.3);
    let from = { x, y };
    let to = { x, y };
    let start = performance.now();
    let flight = 0;
    let hover = 1500;
    let face = -1;
    // Adegan saat diketuk: kabur, datang, besar, menjauh. Di luar itu terbang biasa.
    let mode: "roam" | "flee" | "enter" | "big" | "away" = "roam";
    let zoom = 1;
    let dir = 1;
    let last = performance.now();
    const go = (m: typeof mode, now: number, a: { x: number; y: number }, b: { x: number; y: number }, ms: number) => {
      mode = m;
      from = a;
      to = b;
      flight = ms;
      start = now;
    };

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
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (mode === "roam" && leader && pair.together && leader.roaming) {
        // Menemani: mengejar titik yang berputar pelan di sisi kolibri besar.
        const a = now / 1000;
        const tx = leader.x + Math.cos(a * 0.9) * 70;
        const ty = leader.y - 20 + Math.sin(a * 1.4) * 28;
        const nx = x + (tx - x) * (1 - Math.exp(-5 * dt));
        if (Math.abs(nx - x) > 0.3) face = nx > x ? 1 : -1;
        x = nx;
        y += (ty - y) * (1 - Math.exp(-5 * dt));
        from = to = { x, y };
        flight = 0;
        hover = 400;
        start = now;
      } else if (mode !== "roam") {
        const k = Math.min(1, t / flight);
        if (mode === "big") {
          const s = t / 1000;
          x = to.x + Math.sin(s * 2.1) * 6;
          y = to.y + Math.sin(s * 3.3) * 9;
        } else {
          const e = mode === "flee" ? k * k : ease(k);
          x = from.x + (to.x - from.x) * e;
          y = from.y + (to.y - from.y) * e - (mode === "away" ? Math.sin(Math.PI * e) * 50 : 0);
          if (mode === "enter") zoom = 1 + 2 * e;
          if (mode === "away") zoom = 3 - 2 * e;
        }
        if (k === 1) {
          if (mode === "flee") go("enter", now, { x: dir > 0 ? -160 : w + 160, y: h * 0.45 }, { x: w / 2, y: h * 0.42 }, 900);
          else if (mode === "enter") go("big", now, to, to, 2000);
          else if (mode === "big") {
            // Menjauh ke titik baru sambil mengecil, jadi terlihat terbang pergi, bukan sekadar mengecil di tempat.
            const target = pick();
            face = target.x > x ? 1 : -1;
            go("away", now, { x, y }, target, 1100);
          } else {
            mode = "roam";
            zoom = 1;
            from = to;
            flight = 0;
            hover = 900;
            start = now;
          }
        }
      } else if (t < flight) {
        // Lintasan sedikit melengkung ke atas, seperti burung yang menukik lalu naik.
        const k = ease(t / flight);
        x = from.x + (to.x - from.x) * k;
        y = from.y + (to.y - from.y) * k - Math.sin(Math.PI * k) * 40;
      } else if (t < flight + hover) {
        const s = (t - flight) / 1000;
        x = to.x + Math.sin(s * 2.1) * 4;
        y = to.y + Math.sin(s * 3.3) * 6;
      } else next(now);
      spot.x = x;
      spot.y = y;
      spot.roaming = mode === "roam";
      bird.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${zoom.toFixed(3)}) scaleX(${-face})`;
      raf = requestAnimationFrame(tick);
    };

    const visibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        start = performance.now() - flight - hover;
        raf = requestAnimationFrame(tick);
      }
    };
    // Kabur ke tepi terdekat dengan cepat, sedikit naik.
    const tap = () => {
      if (mode !== "roam") return;
      const w = window.innerWidth;
      dir = x < w / 2 ? -1 : 1;
      face = dir;
      go("flee", performance.now(), { x, y }, { x: dir < 0 ? -160 : w + 160, y: y - 90 }, 450);
    };
    next(performance.now());
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", visibility);
    bird.addEventListener("pointerdown", tap);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", visibility);
      bird.removeEventListener("pointerdown", tap);
    };
  }, [spot, small, leader, pair]);

  return (
    // Gambar kolibri menghadap kiri, jadi dibalik saat terbang ke kanan. Animasinya sudah ada di berkas WebP. Kolibri
    // kedua lebih kecil dan lebih cerah.
    <div
      ref={el}
      aria-hidden="true"
      className={`mm-bird fixed top-0 left-0 z-40 cursor-pointer touch-manipulation ${small ? "-mt-10 -ml-10 w-[78px] brightness-115 saturate-150 sm:w-[94px]" : "-mt-12 -ml-12 w-[96px] sm:w-[116px]"}`}
      style={{ transform: "translate3d(-200px, -200px, 0)" }}
    >
      <Image src={floraSrc(set, "kolibri")} alt="" width={200} height={200} unoptimized className="block h-auto w-full" />
    </div>
  );
}

const HEART = `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 21C5 15.5 1 12 1 7a5.5 5.5 0 0 1 11-1.6A5.5 5.5 0 0 1 23 7c0 5-4 8.5-11 14z" fill="var(--mm-rose)" stroke="var(--inv-accent)" stroke-width="1.2"/></svg>`;

// Sepasang kolibri. Saat keduanya berdekatan sambil terbang biasa, hati kecil muncul di antara mereka, paling sering
// sekali setiap beberapa detik. Setelah pertemuan pertama, kolibri kecil terus menemani yang besar.
export function Hummingbird({ set }: { set: string }) {
  const reduce = useReducedMotion();
  const [one] = useState<Spot>(() => ({ x: -999, y: -999, roaming: true }));
  const [two] = useState<Spot>(() => ({ x: 999, y: 999, roaming: true }));
  const [pair] = useState<Pair>(() => ({ together: false }));
  const hearts = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = hearts.current;
    if (!box || reduce) return;
    let last = 0;
    const timer = window.setInterval(() => {
      const a = one;
      const b = two;
      const now = performance.now();
      if (!a.roaming || !b.roaming || now - last < 5000 || Math.hypot(a.x - b.x, a.y - b.y) > 120) return;
      last = now;
      pair.together = true;
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2 - 30;
      for (let i = 0; i < 6; i++) {
        const h = document.createElement("span");
        h.className = "mm-heart";
        h.innerHTML = HEART;
        const size = 12 + Math.random() * 12;
        h.style.cssText = `left:${cx + (Math.random() - 0.5) * 60}px;top:${cy + (Math.random() - 0.5) * 20}px;width:${size}px;height:${size}px;animation-delay:${i * 0.12}s`;
        box.appendChild(h);
        window.setTimeout(() => h.remove(), 2200);
      }
    }, 150);
    return () => window.clearInterval(timer);
  }, [reduce, one, two, pair]);

  if (reduce) return null;
  return (
    <>
      <Bird set={set} spot={one} pair={pair} />
      <Bird set={set} spot={two} small leader={one} pair={pair} />
      <div ref={hearts} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40" />
    </>
  );
}
