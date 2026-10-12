"use client";

import { Fragment } from "react";
import { pad, useTimeLeft } from "@/components/countdown";
import { MoonDisc } from "./moon-disc";
import { moonOf } from "./moon";

const NIGHTS = 7;

// Hitung mundur dengan deretan bulan tujuh malam menjelang hari H, berakhir di bulan malam pernikahan.
export function RembulanCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);
  const day = Date.parse(target);
  const nights = Array.from({ length: NIGHTS + 1 }, (_, i) => {
    const at = day - (NIGHTS - i) * 864e5;
    return { at, ...moonOf(at) };
  });
  const cells = [
    [t?.days, "Hari"],
    [t?.hours, "Jam"],
    [t?.minutes, "Menit"],
  ] as const;

  return (
    <div>
      <ol className="flex items-end justify-center gap-[clamp(6px,2.4vw,20px)]" aria-label="Fase bulan menjelang hari pernikahan">
        {nights.map((n, i) => {
          const last = i === NIGHTS;
          return (
            <li key={n.at} className="flex flex-col items-center">
              <MoonDisc id={`rb-cd-${i}`} age={n.age} glow={last} small={!last} className={last ? "size-[clamp(44px,12vw,72px)]" : "size-[clamp(18px,5vw,30px)] opacity-80"} />
              <span className={`rb-label mt-3 text-[10px] tracking-[0.16em] tabular-nums ${last ? "text-inv-accent" : "text-inv-gold-light"}`}>
                {last ? "Malam itu" : `H-${NIGHTS - i}`}
              </span>
            </li>
          );
        })}
      </ol>

      {t?.done ? (
        <p className="mt-12 text-center font-display text-[clamp(44px,12vw,72px)] leading-none text-inv-accent">Malam ini</p>
      ) : (
        <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="mt-12 flex items-start justify-center gap-4 sm:gap-10">
          {cells.map(([value, label], i) => (
            <Fragment key={label}>
              {i > 0 && <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-inv-gold-light text-[clamp(44px,13vw,84px)]" />}
              <div className="min-w-[2.6ch] text-center">
                <p className="font-display text-[clamp(44px,13vw,84px)] leading-none text-inv-ink tabular-nums">{value === undefined ? "00" : pad(value)}</p>
                <p className="rb-label mt-3 text-[11px] tracking-[0.3em] text-inv-gold">{label}</p>
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
