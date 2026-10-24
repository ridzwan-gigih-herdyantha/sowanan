"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; speed: number; phase: number; depth: number };

// Seberapa jauh bintang terdekat bergeser terhadap gulir halaman. Bintang lain lebih lambat sesuai kedalamannya.
const PARALLAX = 0.32;
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

// Acak berbibit supaya susunan bintang sama setiap kali halaman dibuka.
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Langit berbintang di canvas: kelip pelan, sesekali bintang jatuh, dan parallax berlapis saat digulir.
// Berhenti saat tak terlihat atau still aktif, dan digambar sekali saja bila pengunjung memilih kurangi gerak.
export function Starfield({ className = "", density = 1, meteors = false, seed = 7, still = false }: { className?: string; density?: number; meteors?: boolean; seed?: number; still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const color = getComputedStyle(canvas).getPropertyValue("--inv-ink").trim() || "#fff";
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let nextMeteor = 2.5;
    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    // Geseran parallax yang diperhalus, mengejar posisi gulir dengan lerp.
    let shift = 0;
    const target = () => -canvas.getBoundingClientRect().top * PARALLAX;

    const build = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rand = seeded(seed);
      const count = Math.round(((width * height) / 2400) * density);
      stars = Array.from({ length: count }, () => {
        const bright = rand() < 0.07;
        const r = bright ? 1.1 + rand() * 0.7 : 0.35 + rand() * 0.65;
        // Bintang besar terasa dekat, jadi bergeser lebih jauh dari bintang kecil.
        return { x: rand() * width, y: rand() * height, r, a: bright ? 0.8 : 0.2 + rand() * 0.55, speed: 0.4 + rand() * 1.4, phase: rand() * Math.PI * 2, depth: 0.15 + (r / 1.8) * 0.85 };
      });
    };

    const draw = (time: number, dt: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const s of stars) {
        // Posisi digulung dalam tinggi canvas supaya langit tidak pernah bolong saat bergeser.
        const y = (((s.y + shift * s.depth) % height) + height) % height;
        ctx.globalAlpha = reduce ? s.a : s.a * (0.6 + 0.4 * Math.sin(time * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.1) {
          ctx.globalAlpha *= 0.18;
          ctx.beginPath();
          ctx.arc(s.x, y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!meteors || reduce) return;
      nextMeteor -= dt;
      if (!meteor && nextMeteor <= 0) {
        const rand = Math.random;
        meteor = { x: width * (0.2 + rand() * 0.7), y: height * rand() * 0.35, vx: -(260 + rand() * 160), vy: 120 + rand() * 80, life: 1 };
        nextMeteor = 6 + Math.random() * 7;
      }
      if (meteor) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life -= dt * 1.1;
        const tail = 0.16;
        const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "transparent");
        ctx.globalAlpha = Math.max(0, Math.sin(Math.PI * meteor.life)) * 0.9;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail);
        ctx.stroke();
        if (meteor.life <= 0) meteor = null;
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      shift += (target() - shift) * (1 - Math.exp(-8 * dt));
      draw(now / 1000, dt);
      if (visible && !still) raf = requestAnimationFrame(loop);
    };

    build();
    if (!reduce) shift = target();
    draw(performance.now() / 1000, 0);
    const resize = new ResizeObserver(() => {
      build();
      draw(performance.now() / 1000, 0);
    });
    resize.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce && !still) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    seen.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
    };
  }, [density, meteors, reduce, seed, still]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 size-full ${className}`} />;
}
