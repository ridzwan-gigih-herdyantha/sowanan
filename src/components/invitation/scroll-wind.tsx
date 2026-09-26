"use client";

import { useEffect } from "react";

// Label gantung (.inv-swing) terdorong oleh kecepatan scroll, lalu berayun pelan sampai diam lagi.
const SPRINGS = [
  { k: 0.028, gain: 0.05 },
  { k: 0.04, gain: 0.038 },
  { k: 0.021, gain: 0.06 },
];
const DAMPING = 0.075;
const MAX = 12;
const MAX_PUSH = 40;

export function ScrollWind() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = SPRINGS.map(() => ({ angle: 0, speed: 0 }));
    let items: HTMLElement[] = [];
    let lastY = window.scrollY;
    let lastT = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const step = Math.min((now - lastT) / 16.7, 3);
      lastT = now;
      const y = window.scrollY;
      const velocity = (y - lastY) / Math.max(step, 0.5);
      const push = -Math.max(-MAX_PUSH, Math.min(MAX_PUSH, velocity));
      lastY = y;

      let moving = Math.abs(push) > 0.1;
      state.forEach((s, i) => {
        const { k, gain } = SPRINGS[i];
        s.speed += (-k * s.angle - DAMPING * s.speed + push * gain) * step;
        s.angle += s.speed * step;
        if (Math.abs(s.angle) > 0.02 || Math.abs(s.speed) > 0.02) moving = true;
      });

      items.forEach((el, i) => {
        const s = state[i % state.length];
        el.style.rotate = `${(MAX * Math.tanh(s.angle / MAX)).toFixed(2)}deg`;
      });

      if (moving) frame = requestAnimationFrame(tick);
      else {
        items.forEach((el) => (el.style.rotate = ""));
        frame = 0;
      }
    };

    const onScroll = () => {
      if (frame) return;
      items = [...document.querySelectorAll<HTMLElement>(".inv-swing")];
      lastT = performance.now();
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
