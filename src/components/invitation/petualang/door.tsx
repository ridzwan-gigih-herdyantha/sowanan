"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { startChime } from "./chiptune";
import { HEART, Sprite } from "./pixel";
import { Backdrop } from "./land";

export type MulaiProps = { groom: string; bride: string; monogram: string; date: string; place: string; year: string; invited: string; onOpen: () => void };

// Matriks Bayer 4x4 untuk urutan kotak, supaya pola tutup dan bukanya rapi seperti transisi game lama.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const ease = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const span = (t: number, from: number, length: number) => ease(Math.min(1, Math.max(0, (t - from) / length)));

// Waktu dalam detik. Tulisan berkedip tanda tombol diterima, kotak menutup layar dari tepi, layar judul
// dilepas saat tertutup penuh, lalu kotak membuka dari tengah dengan hero di baliknya.
const COVER = [0.42, 0.5] as const;
const SWAP = 0.96;
const UNCOVER = [1.02, 0.58] as const;
const END = 1.62;

// Pembuka Co-op Adventure: layar judul game dengan nama mempelai sebagai logo dan tulisan "Tekan untuk mulai".
export function MulaiDoor({ groom, bride, monogram, date, place, year, invited, onOpen }: MulaiProps) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !root.current) return;
    const w = innerWidth;
    const h = innerHeight;
    c.width = w;
    c.height = h;
    const cell = Math.ceil(Math.max(w, h) / 14);
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const far = Math.hypot(cx, cy) || 1;
    // Menutup dari tepi ke tengah, membuka dari tengah ke tepi. Matriks Bayer mengacak urutan per cincin.
    const cells = Array.from({ length: cols * rows }, (_, i) => {
      const x = i % cols;
      const y = Math.floor(i / cols);
      const d = Math.hypot(x - cx, y - cy) / far;
      const b = BAYER[(y % 4) * 4 + (x % 4)] / 16;
      return { x: x * cell, y: y * cell, close: 0.7 * (1 - d) + 0.3 * b, open: 0.7 * d + 0.3 * b };
    });
    ctx.fillStyle = getComputedStyle(root.current).getPropertyValue("--inv-night").trim() || "#2A1F3D";
    const start = performance.now();
    let swapped = false;
    let raf = 0;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const cover = span(t, ...COVER);
      const uncover = span(t, ...UNCOVER);
      ctx.clearRect(0, 0, w, h);
      for (const k of cells) if (cover > k.close * 0.98 && !(uncover > k.open * 0.98)) ctx.fillRect(k.x, k.y, cell, cell);
      if (!swapped && t >= SWAP && scene.current) {
        swapped = true;
        scene.current.style.visibility = "hidden";
      }
      if (t >= END) return setPhase("done");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  function play() {
    if (phase !== "idle") return;
    startChime();
    onOpen();
    setPhase(reduce ? "done" : "playing");
  }

  if (phase === "done") return null;

  return (
    <div ref={root} className="pt-door fixed inset-0 z-50">
      <div ref={scene} className="absolute inset-0 overflow-hidden text-[#FFF6E5]">
        <Backdrop />
        <div className="relative flex h-full flex-col items-center justify-center px-6 pt-10 pb-[190px] text-center sm:pb-[230px]">
          <p className="pt-label pt-on-sky text-[11px] sm:text-[13px]">Undangan pernikahan</p>
          <h1 className="pt-logo mt-4 font-script text-[clamp(46px,13vw,120px)] leading-[0.92] font-bold text-balance">
            <span className="block">{groom}</span>
            <span className="my-3 flex justify-center">
              <Sprite data={HEART} scale={6} />
              <span className="sr-only">&amp;</span>
            </span>
            <span className="block">{bride}</span>
          </h1>
          <p className="pt-label pt-on-sky mt-6 text-[12px] leading-relaxed sm:text-[14px]">
            {date}
            <br />
            {place}
          </p>
          {invited && (
            <div className="pt-dialog mt-7 px-5 py-3 text-left">
              <p className="pt-label text-[10px] opacity-70">Kepada Yth.</p>
              <p className="mt-1 font-display text-[22px] leading-tight font-semibold">{invited}</p>
            </div>
          )}
          <button
            type="button"
            onClick={play}
            className="pt-dialog pt-label mt-9 px-6 py-3.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFF6E5] sm:text-[16px]"
          >
            <span data-confirm={phase === "playing" ? "" : undefined} className="pt-start inline-block">
              <span aria-hidden="true">&#9654; </span>Tekan untuk mulai
            </span>
          </button>
        </div>
        <p className="pt-label absolute inset-x-0 bottom-3 text-center text-[10px] text-[#FFF6E5]/90 sm:bottom-4">&copy; {year} {monogram}</p>
      </div>
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
      {phase === "playing" && <span className="sr-only">Membuka undangan</span>}
    </div>
  );
}
