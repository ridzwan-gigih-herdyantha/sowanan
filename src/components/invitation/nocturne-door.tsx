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
    <div className="nocturne-door fixed inset-0 z-50 overflow-y-auto bg-[#090708] text-inv-ink" role="dialog" aria-modal={!open} aria-hidden={open} aria-label="Sampul undangan Nocturne">
      <div className="grid min-h-dvh lg:grid-cols-[1.05fr_.95fr]">
        <div className="nocturne-door__portrait relative order-1 min-h-[36svh] overflow-hidden border-b border-inv-gold/45 lg:min-h-dvh lg:border-b-0 lg:border-r">
          <Image src={photo} alt={`${groom} dan ${bride}`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-[50%_35%] grayscale" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,8,.06),rgba(9,7,8,.6))] lg:bg-[linear-gradient(90deg,rgba(9,7,8,.05),rgba(9,7,8,.45))]" />
          <div aria-hidden="true" className="absolute inset-4 border border-inv-gold/40 sm:inset-7" />
          <div className="absolute right-8 bottom-8 text-right text-[9px] tracking-[.24em] text-inv-ink/70 uppercase lg:right-10 lg:bottom-10">
            <p>STILL NO. 01</p>
            <p className="mt-2 text-inv-gold">BANDUNG · {date}</p>
          </div>
        </div>

        <div className="relative order-2 flex min-h-[64svh] flex-col justify-between overflow-hidden bg-inv-paper px-7 py-9 sm:px-12 sm:py-12 lg:min-h-dvh lg:px-[clamp(44px,7vw,104px)] lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-inv-line/70 sm:inset-7" />
          <div className="relative flex items-center justify-between text-[9px] tracking-[.24em] text-inv-gold uppercase"><span>NOCTURNE</span><span>UNDANGAN · 2027</span></div>

          <div className="relative my-10 max-w-xl">
            <p className="text-[10px] tracking-[.28em] text-inv-gold uppercase">A love letter after dark</p>
            <div className="mt-7 mb-7 flex items-center gap-4"><span className="h-px w-14 bg-inv-gold/70" /><span className="grid size-12 place-items-center rounded-full border border-inv-gold/70 font-display text-[13px] text-inv-ink">{monogram}</span></div>
            <h1 className="font-display text-[clamp(46px,8vw,92px)] leading-[.94] tracking-[-.045em] text-inv-ink">{groom}<span className="block py-1 font-body text-[.34em] font-light tracking-[.12em] text-inv-gold">&amp;</span>{bride}</h1>
            <p className="mt-6 max-w-[34ch] font-display text-[clamp(18px,2vw,23px)] italic leading-relaxed text-inv-ink/75">Malam ini, sebuah cerita baru dimulai.</p>
            <div className="mt-7">{guestField}</div>
            {invited && <p className="mt-3 text-[11px] text-inv-ink/55">Nama tamu akan tercantum di undangan.</p>}
            <button type="button" onClick={onOpen} aria-label={`Buka undangan ${groom} dan ${bride}`} className="group mt-8 inline-flex items-center gap-5 border border-inv-gold/75 bg-inv-accent px-6 py-4 text-[10px] tracking-[.22em] text-inv-ink uppercase transition-colors hover:bg-inv-gold hover:text-inv-night focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inv-gold">
              Buka undangan <span aria-hidden="true" className="font-display text-lg transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>

          <div className="relative flex items-end justify-between gap-4 border-t border-inv-line pt-4 text-[9px] tracking-[.18em] text-inv-ink/55 uppercase"><span>{place}</span><span>{date}</span></div>
        </div>
      </div>
    </div>
  );
}
