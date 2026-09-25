"use client";

import Image, { getImageProps } from "next/image";
import { useState, type PointerEvent } from "react";
import { Modal } from "./modal";

type Photo = { src: string; w: number; h: number; alt: string };
type Loupe = { i: number; x: number; y: number; bw: number; bh: number; ox: number; oy: number; url: string };

const LOUPE = 170;
const ZOOM = 1.8;

export function ContactSheet({ photos, stamp }: { photos: readonly Photo[]; stamp?: string }) {
  const [developed, setDeveloped] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [loupe, setLoupe] = useState<Loupe | null>(null);
  const photo = active === null ? null : photos[active];
  const allDone = developed.size === photos.length;

  const tap = (i: number) => {
    if (developed.has(i)) return setActive(i);
    setDeveloped((d) => new Set(d).add(i));
    setLoupe(null);
  };

  const move = (i: number, e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || developed.has(i)) return;
    const r = e.currentTarget.getBoundingClientRect();
    const img = e.currentTarget.querySelector("img");
    if (!img?.naturalWidth) return;
    const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const bw = img.naturalWidth * scale;
    const bh = img.naturalHeight * scale;
    setLoupe({
      i,
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      bw,
      bh,
      ox: (r.width - bw) / 2,
      oy: (r.height - bh) / 2,
      url: getImageProps({ src: photos[i].src, alt: "", width: 600, height: Math.round((600 * photos[i].h) / photos[i].w) }).props.src,
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-5 sm:px-0">
        <p className="text-[11px] tracking-[0.18em] text-inv-paper/60">
          {allDone ? "SEMUA SUDAH DICUCI. KETUK UNTUK MEMPERBESAR" : "KETUK NEGATIF UNTUK MENCUCI FOTONYA"}
        </p>
        {!allDone && (
          <button
            type="button"
            onClick={() => setDeveloped(new Set(photos.map((_, i) => i)))}
            className="rounded-sm border border-inv-gold-light px-3 py-2 text-[11px] tracking-[0.18em] text-inv-gold-light transition-colors duration-150 hover:bg-inv-gold-light hover:text-inv-night"
          >
            CUCI SEMUA
          </button>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-1.5 bg-black p-1.5 lg:grid-cols-3 lg:gap-2 lg:p-2">
        {photos.map((p, i) => {
          const done = developed.has(i);
          return (
            <li key={p.src} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <button
                type="button"
                onClick={() => tap(i)}
                onPointerMove={(e) => move(i, e)}
                onPointerLeave={() => setLoupe(null)}
                className={`group relative block w-full overflow-hidden ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[4/5]"} ${
                  done ? "cursor-zoom-in" : "cursor-crosshair"
                }`}
                aria-label={done ? `Perbesar foto: ${p.alt}` : `Cuci foto: ${p.alt}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 980px) 360px, 100vw" : "(min-width: 980px) 360px, 50vw"}
                  className="object-cover transition-[filter] duration-700 ease-out motion-reduce:transition-none"
                  style={{ filter: done ? "none" : "invert(1) sepia(.45) hue-rotate(160deg) saturate(1.4) contrast(.9)" }}
                />
                <span className="absolute top-1.5 left-2 text-[10px] tracking-[0.12em] text-[#f0a64b]">{20 + i}A</span>
                {stamp && done && (
                  <span className="absolute right-2 bottom-1.5 text-[10px] tracking-[0.1em] text-[#f0a64b] [text-shadow:0_0_4px_rgba(240,120,40,.6)]">
                    {stamp}
                  </span>
                )}
                {loupe?.i === i && loupe.url && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute rounded-full border-2 border-[#f0a64b] shadow-[0_8px_30px_rgba(0,0,0,.5)]"
                    style={{
                      width: LOUPE,
                      height: LOUPE,
                      left: loupe.x - LOUPE / 2,
                      top: loupe.y - LOUPE / 2,
                      backgroundImage: `url(${loupe.url})`,
                      backgroundSize: `${loupe.bw * ZOOM}px ${loupe.bh * ZOOM}px`,
                      backgroundPosition: `${-((loupe.x - loupe.ox) * ZOOM - LOUPE / 2)}px ${-((loupe.y - loupe.oy) * ZOOM - LOUPE / 2)}px`,
                    }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <Modal open={photo !== null} onClose={() => setActive(null)} label={photo?.alt ?? "Foto"}>
        {photo && (
          <Image src={photo.src} alt={photo.alt} width={photo.w} height={photo.h} quality={85} sizes="(min-width: 560px) 512px, 100vw" className="h-auto w-full" />
        )}
      </Modal>
    </>
  );
}
