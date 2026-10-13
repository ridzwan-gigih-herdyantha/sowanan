"use client";

import { useEffect } from "react";

// Menandai elemen data-{attr} yang sudah masuk layar dengan data-{attr}-in, supaya CSS memainkan gerak masuknya.
// Pengamatan baru dimulai saat undangan dibuka, karena sebelum itu isi undangan tertutup pembuka dan geraknya
// akan selesai tanpa terlihat. Kelas flag baru dipasang di sini, jadi tanpa JavaScript semua elemen tetap tampil utuh.
export function ScrollReveal({ attr, flag }: { attr: string; flag: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(flag);
    const shell = document.querySelector<HTMLElement>("[data-inv-state]");
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          // Elemen di dalamnya ikut ditandai, supaya tidak ada yang tertinggal tersembunyi.
          for (const el of [e.target, ...e.target.querySelectorAll(`[data-${attr}]`)]) {
            el.setAttribute(`data-${attr}-in`, "");
            seen.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const start = () => document.querySelectorAll(`[data-${attr}]`).forEach((el) => seen.observe(el));
    const opened = () => !shell || shell.dataset.invState === "open";
    const watch = new MutationObserver(() => {
      if (!opened()) return;
      watch.disconnect();
      start();
    });
    if (opened()) start();
    else watch.observe(shell!, { attributes: true, attributeFilter: ["data-inv-state"] });
    return () => {
      watch.disconnect();
      seen.disconnect();
      root.classList.remove(flag);
    };
  }, [attr, flag]);
  return null;
}
