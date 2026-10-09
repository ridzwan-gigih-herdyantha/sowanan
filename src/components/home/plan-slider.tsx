"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

const chevron = (dir: "l" | "r") => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

const arrow =
  "absolute top-[220px] z-10 flex size-11 items-center justify-center rounded-full bg-paper text-ink shadow-[0_8px_20px_rgba(0,0,0,.35)] transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper lg:hidden";

// Di bawah lg kartu paket digeser menyamping: langsung dengan jari (scroll-snap), lewat tombol melayang di kiri
// dan kanan, atau lewat titik di bawah. Tombol sejajar area harga supaya terlihat begitu kartu muncul, karena kartu
// lebih tinggi dari layar HP. Ujung kartu berikutnya mengintip sebagai petunjuk. Di lg ke atas tetap grid.
export function PlanSlider({ labels, columns, children }: { labels: string[]; columns: string; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const slides = Children.toArray(children);
  const n = slides.length;

  // Kartu aktif adalah yang tengahnya paling dekat dengan tengah slider.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      const kids = [...el.children] as HTMLElement[];
      const near = kids.reduce((best, k, i) => (Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid) < Math.abs(kids[best].offsetLeft + kids[best].offsetWidth / 2 - mid) ? i : best), 0);
      setActive(near);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const kid = el?.children[i] as HTMLElement | undefined;
    if (!el || !kid) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: kid.offsetLeft - (el.clientWidth - kid.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        role="region"
        aria-roledescription="carousel"
        aria-label="Daftar paket"
        tabIndex={0}
        className={`${columns} -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 py-2 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:-mx-7 sm:px-7 lg:mx-0 lg:grid lg:gap-[22px] lg:overflow-visible lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden`}
      >
        {slides.map((s, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${labels[i]}, ${i + 1} dari ${n}`} className="w-[84%] shrink-0 snap-center sm:w-[62%] lg:w-auto">
            {s}
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => go(active - 1)} aria-label="Paket sebelumnya" className={`${arrow} left-0 ${active === 0 ? "pointer-events-none opacity-0" : ""}`} tabIndex={active === 0 ? -1 : 0}>
            {chevron("l")}
          </button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Paket berikutnya" className={`${arrow} right-0 ${active === n - 1 ? "pointer-events-none opacity-0" : ""}`} tabIndex={active === n - 1 ? -1 : 0}>
            {chevron("r")}
          </button>
          <div className="mt-5 flex justify-center gap-1 lg:hidden">
            {labels.map((label, i) => (
              <button key={label} type="button" onClick={() => go(i)} aria-label={`Lihat paket ${label}`} aria-current={i === active || undefined} className="p-1.5">
                <span className={`block h-1.5 rounded-full transition-colors duration-200 ${i === active ? "w-5 bg-paper" : "w-1.5 bg-paper/35"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
