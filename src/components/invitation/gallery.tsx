"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";

type Photo = { src: string; w: number; h: number; alt: string };

const tilt = [-2, 1.5, -1, 2.5, -2.5, 1];

export function Gallery({ photos, stamp }: { photos: readonly Photo[]; stamp: string }) {
  const [active, setActive] = useState<number | null>(null);
  const photo = active === null ? null : photos[active];

  return (
    <>
      <ul className="columns-2 gap-4 lg:columns-3 lg:gap-8">
        {photos.map((p, i) => (
          <li key={p.src} className="mb-5 break-inside-avoid lg:mb-8" style={{ rotate: `${tilt[i % tilt.length]}deg` }}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="block w-full bg-[#fbf7f0] p-2 pb-7 text-left shadow-[0_6px_18px_rgba(28,25,22,.18)] transition-transform duration-200 hover:-translate-y-1"
              aria-label={`Buka foto: ${p.alt}`}
            >
              <span className="relative block">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="(min-width: 980px) 320px, 45vw"
                  className="h-auto w-full"
                />
                <span className="absolute right-2 bottom-1.5 text-[10px] font-medium tracking-[0.1em] text-[#f0a64b] [text-shadow:0_0_4px_rgba(240,120,40,.6)]">
                  {stamp}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal open={photo !== null} onClose={() => setActive(null)} label={photo?.alt ?? "Foto"}>
        {photo && (
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.w}
            height={photo.h}
            sizes="(min-width: 560px) 512px, 100vw"
            className="h-auto w-full"
          />
        )}
      </Modal>
    </>
  );
}
