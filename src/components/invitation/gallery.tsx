"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";
import { Arch } from "./sakinah/ornaments";

type Photo = { src: string; w: number; h: number; alt: string; caption?: string; no?: string };

const tilt = [-2, 1.5, -1, 2.5, -2.5, 1];

type Props = { photos: readonly Photo[]; stamp?: string; variant?: "collage" | "grid" | "specimen" | "bleed" | "strip" | "mawaddah" | "game" };

export function Gallery({ photos, stamp, variant = "collage" }: Props) {
  const grid = variant === "grid";
  const specimen = variant === "specimen";
  const mawaddah = variant === "mawaddah";
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

  // Deretan foto tinggi yang digeser ke samping, berhenti tepat di tiap foto, dengan nomor urut di bawahnya.
  if (variant === "strip") {
    return (
      <>
        <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-8 sm:gap-5 sm:px-8 [&::-webkit-scrollbar]:hidden">
          {photos.map((p, i) => (
            <li key={p.src} className="w-[72%] shrink-0 snap-start sm:w-[38%] lg:w-[30%]">
              <button type="button" onClick={() => setActive(i)} className="relative block aspect-[3/4] w-full overflow-hidden rounded-sm" aria-label={`Buka foto: ${p.alt}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 38vw, 72vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
              </button>
              <p className="mt-3 flex justify-between gap-3 text-[12px] tracking-[0.2em] text-inv-gold tabular-nums">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{String(photos.length).padStart(2, "0")}</span>
              </p>
            </li>
          ))}
        </ul>
        {lightbox}
      </>
    );
  }

  // Kartu foto ala game untuk panel sempit: foto pertama lebar di atas, sisanya persegi dua kolom. Foto terakhir
  // yang tersisa sendirian di barisnya ikut dibuat lebar. Bingkai tebal, bayangan padat, sedikit miring
  // bergantian, dan nomor urut di lencana pojok.
  if (variant === "game") {
    return (
      <>
        <ul className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {photos.map((p, i) => {
            const wide = i === 0 || (i === photos.length - 1 && photos.length % 2 === 0);
            return (
              <li key={p.src} className={wide ? "col-span-2" : "min-w-0"} style={wide ? undefined : { rotate: `${i % 2 ? -1.2 : 1.2}deg` }}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="group relative block w-full overflow-hidden rounded-2xl border-[3px] border-inv-line bg-inv-card text-left shadow-[0_5px_0_rgba(0,0,0,.22)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inv-accent"
                  aria-label={`Buka foto: ${p.alt}`}
                >
                  <span className={`relative block ${wide ? "aspect-[16/10]" : "aspect-square"}`}>
                    <Image src={p.src} alt={p.alt} fill sizes={wide ? "(min-width: 560px) 480px, 92vw" : "(min-width: 560px) 240px, 46vw"} className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="absolute top-2 left-2 rounded-full border-2 border-inv-line bg-inv-card px-2 py-0.5 font-display text-[11px] leading-none font-semibold tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p.caption && <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-3 pt-6 pb-2 text-[12px] font-semibold text-white">{p.caption}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-center text-[12px] text-inv-gold">Ketuk foto untuk memperbesar</p>
        {lightbox}
      </>
    );
  }

  if (variant === "bleed") {
    return (
      <>
        <ul className="mx-auto grid max-w-[1000px] grid-cols-2 items-stretch gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-7">
          {photos.map((p, i) => {
            return (
              <li key={p.src} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="group relative block w-full border border-inv-gold/55 bg-inv-paper p-1.5 text-left shadow-[0_10px_28px_rgba(38,42,34,.10)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(38,42,34,.16)] sm:p-2"
                  aria-label={`Buka foto: ${p.alt}`}
                >
                  <span className="relative block aspect-[4/5] overflow-hidden border border-inv-gold/30 bg-inv-wash">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 42vw, 44vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                    />
                  </span>
                  <span className="flex items-center justify-between gap-2 px-1 pt-2.5 text-[9px] tracking-[.18em] text-inv-accent uppercase sm:px-1.5 sm:pt-3 sm:text-[10px]">
                    <span className="truncate">{p.caption || p.alt}</span>
                    <span className="shrink-0 font-display text-[13px] italic tracking-normal text-inv-gold">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {lightbox}
      </>
    );
  }

  return (
    <>
      <ul className={mawaddah ? "grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6" : grid ? "columns-2 gap-3 lg:columns-3 lg:gap-6" : "columns-2 gap-4 lg:columns-3 lg:gap-8"}>
        {photos.map((p, i) => (
          <li
            key={p.src}
            className={mawaddah
              ? `min-w-0 ${i === photos.length - 1 && photos.length % 2 === 1 ? "col-start-2" : "col-start-auto"} ${i === photos.length - 1 && photos.length % 3 === 1 ? "lg:col-start-2" : "lg:col-start-auto"}`
              : grid ? "mb-3 break-inside-avoid lg:mb-6" : specimen ? "mb-6 break-inside-avoid lg:mb-8" : "mb-5 break-inside-avoid lg:mb-8"}
            style={grid || specimen ? undefined : { rotate: `${tilt[i % tilt.length]}deg` }}
          >
            <button
              type="button"
              onClick={() => setActive(i)}
              className={
                mawaddah
                  ? "group relative block w-full border border-inv-gold/45 bg-inv-wash p-2 text-left shadow-[0_10px_26px_rgba(22,62,67,.08)] transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(22,62,67,.14)]"
                  : specimen
                  ? "relative block w-full border border-inv-line bg-inv-wash p-2.5 text-left transition-transform duration-200 hover:-translate-y-1"
                  : grid
                    ? "group block w-full overflow-hidden text-left"
                    : "block w-full bg-[var(--inv-card,#fbf7f0)] p-2 pb-7 text-left shadow-[0_6px_18px_rgba(28,25,22,.18)] transition-transform duration-200 hover:-translate-y-1"
              }
              aria-label={`Buka foto: ${p.alt}`}
            >
              {specimen && <span className="inv-tape -top-2.5 left-1/2 z-10 -translate-x-1/2 rotate-2" aria-hidden="true" />}
              {mawaddah ? (
                <Arch className="aspect-[4/5] w-full" line="var(--sk-emas)" gap="var(--inv-wash)">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 980px) 320px, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                </Arch>
              ) : (
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
              )}
              {mawaddah && <span className="flex items-center justify-between gap-2 px-1 pt-2.5 text-[9px] tracking-[.12em] text-inv-accent uppercase sm:px-1.5 sm:pt-3"><span className="truncate">{p.caption || p.alt}</span><span className="shrink-0 font-display text-[13px] italic tracking-normal text-inv-gold">{String(i + 1).padStart(2, "0")}</span></span>}
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
