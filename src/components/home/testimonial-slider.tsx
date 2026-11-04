"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { chevron } from "./plan-slider";

const arrow =
  "flex size-11 items-center justify-center rounded-full border border-line text-wine transition-colors duration-150 hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:pointer-events-none disabled:opacity-40";

// Di lg tampil tiga kartu selebar section dan digeser lewat tombol, satu kartu tiap klik. Di bawah lg digeser
// lewat jari (scroll-snap) dengan ujung kartu berikutnya mengintip. Tombol hilang kalau semua kartu sudah muat.
export function TestimonialSlider({ title, label, children }: { title: ReactNode; label: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdge({ start: el.scrollLeft <= 1, end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 });
    const size = new ResizeObserver(update);
    size.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      size.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    const [a, b] = (el ? [...el.children] : []) as HTMLElement[];
    if (!el || !a || !b) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (b.offsetLeft - a.offsetLeft), behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-6 sm:mb-11">
        {title}
        {!(edge.start && edge.end) && (
          <div className="hidden flex-none gap-2.5 lg:flex">
            <button type="button" onClick={() => go(-1)} disabled={edge.start} aria-label="Testimoni sebelumnya" className={arrow}>
              {chevron("l")}
            </button>
            <button type="button" onClick={() => go(1)} disabled={edge.end} aria-label="Testimoni berikutnya" className={arrow}>
              {chevron("r")}
            </button>
          </div>
        )}
      </div>
      <ul
        ref={track}
        tabIndex={0}
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-wine sm:-mx-7 sm:scroll-pl-7 sm:gap-5 sm:px-7 lg:mx-0 lg:scroll-pl-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </>
  );
}
