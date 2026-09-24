"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Photo = { src: string; alt: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function PhotoSlider({ photos, sizes }: { photos: readonly Photo[]; sizes: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = (to: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, to));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  const arrow =
    "flex size-10 items-center justify-center rounded-sm border border-inv-line transition-colors duration-150 hover:border-inv-ink disabled:opacity-30";

  return (
    <div>
      <div
        ref={track}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        aria-label="Foto pasangan"
      >
        {photos.map((p) => (
          <div key={p.src} className="relative aspect-[5/6] w-full shrink-0 snap-center">
            <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] font-medium tracking-[0.24em] tabular-nums" aria-live="polite">
          {pad(index + 1)} / {pad(photos.length)}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={arrow} aria-label="Foto sebelumnya">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M20 12H4M10 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === photos.length - 1}
            className={arrow}
            aria-label="Foto berikutnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
