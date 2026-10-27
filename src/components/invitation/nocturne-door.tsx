"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export type NocturneDoorProps = {
  groom: string;
  bride: string;
  monogram: string;
  date: string;
  place: string;
  photo: string;
  invited: string;
  guestField: ReactNode;
  open: boolean;
  onOpen: () => void;
};

export function NocturneDoor({ groom, bride, monogram, date, place, photo, invited, guestField, open, onOpen }: NocturneDoorProps) {
  return (
    <div className="nocturne-door fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#090708] px-4 py-5 text-inv-ink sm:px-8 sm:py-8" role="dialog" aria-modal={!open} aria-hidden={open} aria-label="Sampul undangan Nocturne">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(143,61,74,.24),transparent_48%),linear-gradient(135deg,rgba(197,154,104,.06),transparent_42%,rgba(143,61,74,.08))]" />
      <article className="nocturne-door__cover relative isolate flex min-h-[min(790px,calc(100svh-40px))] w-full max-w-[470px] flex-col items-center justify-between overflow-hidden border border-inv-gold/60 bg-inv-night px-7 py-8 text-center shadow-[0_30px_100px_rgba(0,0,0,.55)] sm:min-h-[min(820px,calc(100svh-64px))] sm:px-12 sm:py-11">
        <Image src={photo} alt={`${groom} dan ${bride}`} fill priority sizes="(min-width: 640px) 470px, 100vw" className="-z-20 object-cover object-[50%_34%] grayscale opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,8,.34)_0%,rgba(9,7,8,.72)_39%,rgba(9,7,8,.96)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-inv-gold/35 sm:inset-4" />
        <div aria-hidden="true" className="pointer-events-none absolute top-[22%] left-1/2 size-[min(64vw,300px)] -translate-x-1/2 rounded-full border border-inv-gold/15" />

        <div className="relative flex w-full items-center justify-between text-[9px] tracking-[.28em] text-inv-gold uppercase"><span>NOCTURNE</span><span>INVITATION · {date}</span></div>

        <div className="relative flex w-full flex-col items-center py-8">
          <p className="text-[9px] tracking-[.3em] text-inv-ink/75 uppercase">A love letter after dark</p>
          <div className="mt-8 grid size-[74px] place-items-center rounded-full border border-inv-gold/60 bg-inv-night/35 font-display text-[15px] tracking-[.12em] text-inv-gold shadow-[0_0_50px_rgba(197,154,104,.1)]">{monogram}</div>
          <h1 className="mt-8 font-display text-[clamp(42px,10vw,65px)] leading-[.96] tracking-[-.035em] text-inv-ink">{groom}<span className="block py-2 font-body text-[.26em] font-light tracking-[.28em] text-inv-gold">AND</span>{bride}</h1>
          <p className="mt-5 font-display text-[19px] italic leading-relaxed text-inv-ink/75">Sebuah malam, dua hati, satu janji.</p>
          <div className="mt-7 min-h-6">{guestField}</div>
          {invited && <p className="mt-2 text-[10px] tracking-[.12em] text-inv-ink/55">UNDANGAN KHUSUS UNTUK ANDA</p>}
          <button type="button" onClick={onOpen} aria-label={`Buka undangan ${groom} dan ${bride}`} className="group mt-8 inline-flex min-h-12 items-center justify-center gap-5 border border-inv-gold/80 bg-inv-accent px-7 py-3 text-[10px] tracking-[.24em] text-inv-ink uppercase shadow-[0_10px_32px_rgba(0,0,0,.28)] transition duration-300 hover:bg-inv-gold hover:text-inv-night focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inv-gold">
            Buka undangan <span aria-hidden="true" className="font-display text-lg transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        <div className="relative w-full border-t border-inv-gold/35 pt-4 text-[9px] leading-relaxed tracking-[.18em] text-inv-ink/60 uppercase"><p>{place}</p><p className="mt-1 text-inv-gold/80">{date}</p></div>
      </article>
    </div>
  );
}
