"use client";

import { useEffect } from "react";
import { SHAPES } from "./pop";

const WORDS = ["Asik!", "Yeay!", "Sah!", "Cihuy!", "Wow!", "Mantap!", "Horee!"];
const TONES = [
  { fill: "var(--inv-accent)", text: "var(--inv-card)" },
  { fill: "var(--tp-sun)", text: "var(--inv-ink)" },
  { fill: "var(--inv-gold)", text: "var(--inv-card)" },
];
// Ketukan di elemen ini tetap berjalan seperti biasa tanpa letupan kata.
const SKIP = "a, button, input, textarea, select, label, canvas, form, [role=button], [role=timer], .tp-door";

// Interaksi satu layar penuh. Stiker yang diketuk bergoyang, dan ketukan di tempat kosong memunculkan letupan kata
// ala komik di titik ketukan. Memakai click, bukan pointerdown, supaya menggulir layar tidak memicunya.
export function StickerPlay() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    let lastAt = 0;
    const click = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const root = target?.closest<HTMLElement>(".tp-theme");
      if (!target || !root || target.closest(SKIP)) return;
      const sticker = target.closest(".tp-stk");
      if (sticker instanceof HTMLElement) {
        sticker.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.35) rotate(-14deg)", offset: 0.35 },
            { transform: "scale(0.92) rotate(8deg)", offset: 0.7 },
            { transform: "scale(1)" },
          ],
          { duration: 520, easing: "ease-out" },
        );
        return;
      }
      if (window.getSelection()?.toString() || e.timeStamp - lastAt < 220) return;
      lastAt = e.timeStamp;

      const tone = TONES[n % TONES.length];
      const word = WORDS[n % WORDS.length];
      n++;
      const el = document.createElement("span");
      el.setAttribute("aria-hidden", "true");
      el.className = "tp-label pointer-events-none fixed z-40 grid size-24 place-items-center text-[17px]";
      el.style.left = `${e.clientX - 48}px`;
      el.style.top = `${e.clientY - 48}px`;
      el.style.color = tone.text;
      el.innerHTML = `<svg viewBox="-4 -4 112 112" style="position:absolute;inset:0;overflow:visible"><path d="${SHAPES.burst}" transform="translate(4 4)" fill="var(--inv-ink)"/><path d="${SHAPES.burst}" fill="${tone.fill}" stroke="var(--inv-ink)" stroke-width="3" stroke-linejoin="round"/></svg><span style="position:relative">${word}</span>`;
      root.appendChild(el);
      const tilt = (n % 2 ? 1 : -1) * (6 + (n % 3) * 4);
      el.animate(
        [
          { transform: "scale(0) rotate(0deg)", opacity: 1 },
          { transform: `scale(1.15) rotate(${tilt}deg)`, opacity: 1, offset: 0.25 },
          { transform: `scale(1) rotate(${tilt}deg)`, opacity: 1, offset: 0.7 },
          { transform: `translateY(-28px) scale(0.9) rotate(${tilt}deg)`, opacity: 0 },
        ],
        { duration: 1100, easing: "cubic-bezier(.3,1.4,.5,1)" },
      )
        .finished.catch(() => {})
        .then(() => el.remove());
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  return null;
}
