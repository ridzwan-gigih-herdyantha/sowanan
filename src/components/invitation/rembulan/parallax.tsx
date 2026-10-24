"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

// Isi bergeser lebih lambat dari gulir. speed 0,2 berarti tertinggal 20%, diukur dari tengah layar dan dibatasi
// max piksel supaya tidak menabrak teks. Diperhalus dengan lerp dan hanya jalan saat terlihat.
export function Parallax({ children, speed = 0.2, max = 70, className = "" }: { children: ReactNode; speed?: number; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    let visible = false;
    let current: number | null = null;
    let last = performance.now();
    // Posisi diukur dari induk, karena posisi elemen sendiri ikut berubah oleh geseran ini.
    const anchor = el.parentElement ?? el;
    const target = () => {
      const box = anchor.getBoundingClientRect();
      const off = -(box.top + box.height / 2 - innerHeight / 2) * speed;
      return Math.max(-max, Math.min(max, off));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const to = target();
      current = current === null ? to : current + (to - current) * (1 - Math.exp(-7 * dt));
      el.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0)`;
      if (visible || Math.abs(to - current) > 0.2) raf = requestAnimationFrame(frame);
    };

    const seen = new IntersectionObserver(
      ([entry]) => {
        // Saat mendekati layar posisi langsung disetel, supaya isi tidak terlihat melayang dari posisi lama.
        if (entry.isIntersecting && !visible) current = null;
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      { rootMargin: "20% 0px" },
    );
    seen.observe(anchor);
    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
    };
  }, [reduce, speed, max]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
