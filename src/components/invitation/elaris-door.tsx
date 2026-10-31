"use client";

import Image from "next/image";
import { Corner } from "@/components/invitation/sutra/ornaments";

export type ElarisDoorProps = {
  couple: string;
  monogram: string;
  date: string;
  place: string;
  photo: string;
  seal: string;
  invited: string;
  open: boolean;
  onOpen: () => void;
};

export function ElarisDoor({ couple, monogram, date, place, photo, seal, invited, open, onOpen }: ElarisDoorProps) {
  return (
    <div className="elaris-door fixed inset-0 z-50 grid place-items-center overflow-hidden bg-inv-paper px-5 py-7 text-inv-ink" role="dialog" aria-modal={!open} aria-hidden={open} aria-label="Sampul undangan pernikahan">
      <div aria-hidden="true" className="elaris-door__ground absolute inset-0 bg-inv-paper" />
      <div aria-hidden="true" className="elaris-door__wing elaris-door__wing--left absolute inset-y-0 left-0 w-1/2 border-r border-inv-gold/60 bg-inv-paper">
        <div className="absolute inset-3 border border-inv-gold/25 sm:inset-6" />
        <Corner at="tl" size="size-12 sm:size-16" className="m-4 text-inv-gold" />
        <Corner at="bl" size="size-12 sm:size-16" className="m-4 text-inv-gold" />
      </div>
      <div aria-hidden="true" className="elaris-door__wing elaris-door__wing--right absolute inset-y-0 right-0 w-1/2 border-l border-inv-gold/60 bg-inv-paper">
        <div className="absolute inset-3 border border-inv-gold/25 sm:inset-6" />
        <Corner at="tr" size="size-12 sm:size-16" className="m-4 text-inv-gold" />
        <Corner at="br" size="size-12 sm:size-16" className="m-4 text-inv-gold" />
      </div>

      <div className="elaris-door__card relative z-30 w-full max-w-[440px]">
        <div className="border border-inv-gold/70 bg-inv-wash p-2 shadow-[0_24px_70px_rgba(38,42,34,.2)] sm:p-3">
          <div className="border border-inv-gold/35 px-4 pb-5 pt-6 text-center sm:px-7 sm:pb-7 sm:pt-8">
            <p className="font-body text-[9px] tracking-[.32em] text-inv-accent uppercase">Undangan Pernikahan</p>
            <p className="mt-2 font-display text-[11px] tracking-[.2em] text-inv-gold uppercase">Dengan penuh syukur</p>

            <div className="relative mx-auto mt-5 aspect-[4/3] max-h-[34svh] overflow-hidden border border-inv-gold/60 bg-inv-paper p-1.5">
              <div className="relative size-full overflow-hidden">
                <Image src={photo} alt="" fill preload sizes="(min-width: 640px) 390px, 90vw" className="object-cover object-[50%_34%]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              <Corner at="tl" size="size-10" className="m-1.5 text-inv-gold" />
              <Corner at="tr" size="size-10" className="m-1.5 text-inv-gold" />
              <Corner at="br" size="size-10" className="m-1.5 text-inv-gold" />
              <Corner at="bl" size="size-10" className="m-1.5 text-inv-gold" />
            </div>

            <p className="mt-5 font-display text-[clamp(30px,8vw,42px)] leading-[.98] text-inv-accent">{couple}</p>
            <p className="mt-3 text-[10px] tracking-[.16em] text-inv-ink/65">{date}</p>
            <p className="mt-1 text-[10px] tracking-[.14em] text-inv-ink/55">{place}</p>
            {invited && <p className="mt-4 text-[11px] text-inv-ink/65">Kepada Yth. <span className="font-medium text-inv-accent">{invited}</span></p>}

            <button type="button" onClick={onOpen} aria-label={`Buka undangan ${couple}`} className="group mx-auto mt-5 flex flex-col items-center rounded-sm px-4 py-1 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inv-accent">
              <span className="relative block size-[76px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:size-[84px]">
                <Image src={seal} alt="" fill sizes="84px" className="object-contain drop-shadow-[0_5px_8px_rgba(38,42,34,.2)]" />
                <span className="absolute inset-0 flex items-center justify-center font-display text-[15px] text-[#eadbb7]">{monogram}</span>
              </span>
              <span className="mt-1 text-[9px] tracking-[.25em] text-inv-accent uppercase">Sentuh segel untuk membuka</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
