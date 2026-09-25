"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";

type Photo = { src: string; w: number; h: number; alt: string; caption?: string; no?: string };

const tilt = [-2, 1.5, -1, 2.5, -2.5, 1];

type Props = { photos: readonly Photo[]; stamp?: string; variant?: "collage" | "grid" | "specimen" | "contact" };

export function Gallery({ photos, stamp, variant = "collage" }: Props) {
  const grid = variant === "grid";
  const specimen = variant === "specimen";
  const [active, setActive] = useState<number | null>(null);
  const photo = active === null ? null : photos[active];

  const lightbox = (
    <Modal open={photo !== null} onClose={() => setActive(null)} label={photo?.alt ?? "Foto"}>
      {photo && (
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.w}
          height={photo.h}
          quality={85}
          sizes="(min-width: 560px) 512px, 100vw"
          className="h-auto w-full"
        />
      )}
    </Modal>
  );

  if (variant === "contact") {
    return (
      <>
        <ul className="grid grid-cols-2 gap-1.5 bg-black p-1.5 lg:grid-cols-3">
          {photos.map((p, i) => (
            <li key={p.src}>
              <button type="button" onClick={() => setActive(i)} className="group relative block aspect-[4/5] w-full overflow-hidden" aria-label={`Buka foto: ${p.alt}`}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 980px) 360px, 50vw"
                  className="object-cover transition-opacity duration-200 group-hover:opacity-85"
                />
                <span className="absolute top-1.5 left-2 text-[10px] tracking-[0.12em] text-[#f0a64b]">{20 + i}A</span>
                {stamp && (
                  <span className="absolute right-2 bottom-1.5 text-[10px] tracking-[0.1em] text-[#f0a64b] [text-shadow:0_0_4px_rgba(240,120,40,.6)]">
                    {stamp}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {lightbox}
      </>
    );
  }

  return (
    <>
      <ul className={grid ? "columns-2 gap-3 lg:columns-3 lg:gap-6" : "columns-2 gap-4 lg:columns-3 lg:gap-8"}>
        {photos.map((p, i) => (
          <li
            key={p.src}
            className={grid ? "mb-3 break-inside-avoid lg:mb-6" : specimen ? "mb-6 break-inside-avoid lg:mb-8" : "mb-5 break-inside-avoid lg:mb-8"}
            style={grid || specimen ? undefined : { rotate: `${tilt[i % tilt.length]}deg` }}
          >
            <button
              type="button"
              onClick={() => setActive(i)}
              className={
                specimen
                  ? "relative block w-full border border-inv-line bg-inv-wash p-2.5 text-left transition-transform duration-200 hover:-translate-y-1"
                  : grid
                    ? "group block w-full overflow-hidden text-left"
                    : "block w-full bg-[#fbf7f0] p-2 pb-7 text-left shadow-[0_6px_18px_rgba(28,25,22,.18)] transition-transform duration-200 hover:-translate-y-1"
              }
              aria-label={`Buka foto: ${p.alt}`}
            >
              {specimen && <span className="inv-tape -top-2.5 left-1/2 z-10 -translate-x-1/2 rotate-2" aria-hidden="true" />}
              <span className="relative block">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="(min-width: 980px) 320px, 45vw"
                  className={grid ? "h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]" : "h-auto w-full"}
                />
                {stamp && (
                  <span className="absolute right-2 bottom-1.5 text-[10px] font-medium tracking-[0.1em] text-[#f0a64b] [text-shadow:0_0_4px_rgba(240,120,40,.6)]">
                    {stamp}
                  </span>
                )}
              </span>
              {specimen && (p.no || p.caption) && (
                <span className="mt-2.5 flex items-baseline justify-between gap-2 border-t border-inv-line pt-2">
                  <span className="font-display text-[14px] italic">{p.caption}</span>
                  {p.no && <span className="shrink-0 text-[10px] font-medium tracking-[0.18em] text-inv-gold">No. {p.no}</span>}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {lightbox}
    </>
  );
}
