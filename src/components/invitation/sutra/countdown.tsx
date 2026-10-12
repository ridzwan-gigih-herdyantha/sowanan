"use client";

import { Fragment } from "react";
import { pad, useTimeLeft } from "@/components/countdown";

export function SutraCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);

  if (t?.done) return <p className="font-script text-[clamp(56px,14vw,88px)] leading-none text-inv-accent">Hari ini</p>;

  const cells = [
    [t?.days, "Hari"],
    [t?.hours, "Jam"],
    [t?.minutes, "Menit"],
  ] as const;

  return (
    <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="flex items-center justify-center gap-3 sm:gap-8">
      {cells.map(([value, label], i) => (
        <Fragment key={label}>
          {i > 0 && <span aria-hidden="true" className="size-2 shrink-0 rotate-45 border border-inv-gold" />}
          <div className="min-w-[3ch] text-center">
            <p className="font-display text-[clamp(44px,13vw,88px)] leading-none text-inv-accent tabular-nums">{value === undefined ? "00" : pad(value)}</p>
            <p className="mt-3 font-display text-[11px] tracking-[0.3em] text-inv-gold uppercase">{label}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
