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
const DOOR = { x:61.5, y: 40 };
// Titik gambar yang diusahakan tetap terlihat di tengah layar sempit, antara gapura dan pintu.
const FOCUS = 0.54;
const ZOOM_MS = 950;
// Balok gapura pada gambar: pusatnya di sekitar 50,4% x 51,5%, lebar papan 11,6%, dan miring 27 derajat ke kanan bawah
// (garis isometrik 2:1), jadi tulisan dimiringkan dengan sudut yang sama supaya terlihat menempel di balok.
const BEAM = { x: 50, y: 50, w: 13.6, h: 7.4, tilt: 27 };
// Jumlah huruf yang muat di papan pada ukuran penuh. Teks yang lebih panjang dikecilkan.
const NAME_FIT = 13;
const PLACE_FIT = 24;

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
  const name = `${groom} & ${bride}`;
  const fit = (size: number, text: string, max: number) => `calc(var(--gd-w) * ${(size * Math.min(1, max / text.length)).toFixed(5)})`;
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
        <div
          className="absolute flex flex-col items-center justify-center whitespace-nowrap rounded-[0.25em] border-[0.12em] border-[#4a2c17] bg-[#9a6a3f] text-center text-[#fff4dc] shadow-[0_0.18em_0_rgba(40,20,8,.45)] [text-shadow:0_0.07em_0_rgba(40,20,8,.55)]"
          style={{
            left: `${BEAM.x}%`,
            top: `${BEAM.y}%`,
            width: `${BEAM.w}%`,
            height: `${BEAM.h}%`,
            transform: `translate(-50%, -50%) skewY(${BEAM.tilt}deg)`,
          }}
        >
          <h1 className="font-display leading-none font-semibold" style={{ fontSize: fit(0.0135, name, NAME_FIT) }}>
            {name}
          </h1>
          <p className="mt-[0.3em] leading-none font-bold opacity-90" style={{ fontSize: fit(0.0082, place, PLACE_FIT) }}>
            {place}
          </p>
          <p className="mt-[0.25em] leading-none font-bold text-[#ffd98a]" style={{ fontSize: fit(0.0082, date, PLACE_FIT) }}>
            {date}
          </p>
        </div>
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
          {invited ? (
            <p className="text-[13px] text-inv-gold">
              Kepada Yth.
              <span className="mt-0.5 block font-display text-[clamp(22px,6.4vw,28px)] leading-tight font-semibold text-inv-ink">{invited}</span>
            </p>
          ) : (
            <p className="font-display text-[clamp(17px,5vw,21px)] leading-snug font-semibold">Ketuk pintu gedung untuk masuk</p>
          )}
        </section>
        <Walker className="gd-arrive -mt-1 w-[clamp(96px,26vw,128px)]" />
      </div>
    </div>
  );
}
