"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Walker } from "./art";

export type GedungProps = {
  groom: string;
  bride: string;
  date: string;
  place: string;
  invited: string;
  onOpen: () => void;
};

// Peta cover berukuran 1672 x 941. Pintu gedung ada di sekitar 61,5% x 40% gambar.
const RATIO = 1672 / 941;
const DOOR = { x: 61.5, y: 40 };
// Titik gambar yang diusahakan tetap terlihat di tengah layar sempit, antara gapura dan pintu.
const FOCUS = 0.54;
const ZOOM_MS = 950;

// Cover berupa peta isometrik: pintu gedung di atas sebagai tombol buka, papan nama di tengah, dan pasangan
// yang baru turun di parkiran. Saat dibuka, kamera mendekat ke pintu lalu isi undangan terbuka.
export function GedungDoor({ groom, bride, date, place, invited, onOpen }: GedungProps) {
  const [entering, setEntering] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = () => {
    if (entering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return onOpen();
    setEntering(true);
    timer.current = window.setTimeout(onOpen, ZOOM_MS);
  };

  // Peta menutupi seluruh layar. Di layar sempit, bagian yang terlihat digeser ke arah pintu.
  const w = `max(100vw, calc(100dvh * ${RATIO}))`;
  const stage = {
    "--gd-w": w,
    width: w,
    height: `max(100dvh, calc(100vw / ${RATIO}))`,
    left: `clamp(calc(100vw - ${w}), calc(50vw - ${w} * ${FOCUS}), 0px)`,
    top: "50%",
    transformOrigin: `${DOOR.x}% ${DOOR.y}%`,
  } as CSSProperties;

  return (
    <div className="gd-door fixed inset-0 z-50 overflow-hidden bg-inv-sky text-inv-ink" role="dialog" aria-label="Sampul undangan" data-entering={entering}>
      <div className="gd-stage absolute" style={stage}>
        <Image src="/img/rafi-kayla/cover-map.webp" alt="" fill priority sizes="(min-width: 900px) 100vw, 160vw" className="object-cover" />
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${DOOR.x}%`, top: `${DOOR.y}%` }}>
          <button
            type="button"
            onClick={enter}
            aria-label={`Buka undangan ${groom} dan ${bride}`}
            className="gd-hotspot group relative flex h-[clamp(84px,17dvh,150px)] w-[clamp(56px,6vw,96px)] items-center justify-center rounded-t-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span aria-hidden="true" className="gd-ring absolute inset-0 rounded-t-full border-[3px] border-white/90" />
            <span className="gd-pill pointer-events-none absolute -top-[clamp(40px,7dvh,52px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-[3px] border-inv-line bg-inv-accent px-4 py-2 font-display text-[clamp(13px,3.6vw,17px)] leading-none text-inv-paper shadow-[0_5px_0_rgba(0,0,0,.28)] transition-transform group-hover:-translate-y-1 group-active:translate-y-0.5">
              Buka undangan
            </span>
          </button>
        </div>
      </div>

      <p className="gd-fade pointer-events-none absolute inset-x-0 top-[max(14px,2.4dvh)] flex justify-center">
        <span className="rounded-full border-[3px] border-inv-line bg-inv-card px-4 py-1.5 font-display text-[clamp(11px,3vw,14px)] tracking-[.14em] uppercase shadow-[0_4px_0_rgba(0,0,0,.2)]">Undangan pernikahan</span>
      </p>

      <div className="gd-fade pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-[max(14px,2.4dvh)]">
        <section className="gd-board w-full max-w-[420px] rounded-[22px] border-[3px] border-inv-line bg-inv-card px-5 pt-4 pb-4 text-center shadow-[0_7px_0_rgba(0,0,0,.28)]">
          <h1 className="font-display text-[clamp(30px,9vw,46px)] leading-[.95] font-semibold text-inv-accent">
            {groom}
            <span className="mx-2 text-[.6em] text-inv-ink">&amp;</span>
            {bride}
          </h1>
          <p className="mt-2 text-[13px] font-bold">{date}</p>
          <p className="text-[12px] text-inv-gold">{place}</p>
          {invited && (
            <p className="mt-2.5 border-t-2 border-dashed border-inv-line/25 pt-2 text-[12px] text-inv-gold">
              Kepada Yth. <span className="font-bold text-inv-ink">{invited}</span>
            </p>
          )}
        </section>
        <Walker className="gd-arrive -mt-1 w-[clamp(96px,26vw,128px)]" />
      </div>
    </div>
  );
}
