"use client";

import { useEffect } from "react";

// Yang dimunculkan: judul, teks, dan foto. Isi formulir dan elemen yang sudah punya gerak sendiri dilewati.
const TARGETS = { all: "h2, h3, p, blockquote, figure, img", images: "img" } as const;
const SKIP = "form, [role=timer], [data-reveal], [data-su], [data-lr], [aria-live], .inv-enter";

export type RevealMode = keyof typeof TARGETS;

// Wadah gulir ke samping terdekat. Isinya terpotong oleh wadah itu, jadi wadahnya yang diamati.
function strip(el: HTMLElement) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const x = getComputedStyle(p).overflowX;
    if (x === "auto" || x === "scroll") return p;
  }
  return null;
}

// Reveal bawaan semua tema: elemen di dalam section memudar naik saat digulir masuk layar, sama seperti di homepage.
// Mode images hanya untuk foto, dipakai tema yang teksnya sudah punya gerak sendiri. Dipasang setelah undangan
// dibuka. Elemen yang sudah terlihat saat dipasang tidak disembunyikan, jadi isi yang sedang dibaca tidak pernah
// berkedip. Section pertama (hero) dilewati karena punya gerak masuk sendiri.
export function AutoReveal({ root, mode = "all" }: { root: HTMLElement | null; mode?: RevealMode }) {
  useEffect(() => {
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = Array.from(root.querySelectorAll("main > section")).slice(1);
    // Pemicu (elemen yang diamati) ke elemen yang dimunculkan. Biasanya sama, kecuali isi deretan geser.
    const groups = new Map<Element, HTMLElement[]>();
    const taken = new Set<HTMLElement>();
    for (const section of sections) {
      let order = 0;
      for (const node of section.querySelectorAll<HTMLElement>(TARGETS[mode])) {
        // Foto next/image berada di wadah sendiri, jadi wadahnya yang digerakkan.
        const el = node.tagName === "IMG" && node.parentElement && getComputedStyle(node).position === "absolute" ? node.parentElement : node;
        if (el.closest(SKIP) || taken.has(el) || [...taken].some((x) => x.contains(el))) continue;
        el.style.setProperty("--reveal-delay", `${(order++ % 4) * 70}ms`);
        taken.add(el);
        const trigger = strip(el) ?? el;
        groups.set(trigger, [...(groups.get(trigger) ?? []), el]);
      }
    }

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const items = groups.get(e.target) ?? [];
          if (!seen.has(e.target)) {
            seen.add(e.target);
            if (e.isIntersecting) {
              observer.unobserve(e.target);
              continue;
            }
            items.forEach((el) => el.classList.add("reveal"));
          } else if (e.isIntersecting) {
            items.forEach((el) => el.classList.add("in"));
            observer.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    groups.forEach((_, trigger) => observer.observe(trigger));
    return () => observer.disconnect();
  }, [root, mode]);
  return null;
}
