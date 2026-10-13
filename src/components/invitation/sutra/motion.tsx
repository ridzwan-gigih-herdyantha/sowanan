"use client";

import { useEffect } from "react";

// Menandai ornamen Sutra yang sudah masuk layar, supaya CSS memainkan gerak masuknya sekali saja.
// Kelas su-js baru dipasang di sini, jadi tanpa JavaScript semua ornamen tetap tampil utuh.
export function SutraMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("su-js");
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          // Ornamen di dalamnya ikut ditandai, supaya tidak ada yang tertinggal tersembunyi.
          for (const el of [e.target, ...e.target.querySelectorAll("[data-su]")] as HTMLElement[]) {
            el.dataset.suIn = "";
            seen.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-su]").forEach((el) => seen.observe(el));
    return () => {
      seen.disconnect();
      root.classList.remove("su-js");
    };
  }, []);
  return null;
}
