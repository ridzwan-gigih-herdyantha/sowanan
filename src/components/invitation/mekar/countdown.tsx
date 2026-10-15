"use client";

import { Fragment } from "react";
import { pad, useTimeLeft } from "@/components/countdown";

// Hitung mundur tanpa kotak: angka besar miring, label kecil, dan belah ketupat emas sebagai pemisah.
export function MekarCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);

  if (t?.done) return <p className="mm-amp text-center text-[clamp(56px,14vw,88px)] leading-none text-inv-accent">Hari ini</p>;

  const cells = [
    [t?.days, "Hari"],
    [t?.hours, "Jam"],
    [t?.minutes, "Menit"],
  ] as const;

  return (
    <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="flex items-center justify-center gap-4 sm:gap-10">
      {cells.map(([value, label], i) => (
        <Fragment key={label}>
          {i > 0 && <span aria-hidden="true" className="size-2 shrink-0 rotate-45 border border-inv-gold" />}
          <div className="min-w-[3ch] text-center">
            <p className="font-display text-[clamp(46px,13vw,84px)] leading-none font-light text-inv-accent tabular-nums italic">{value === undefined ? "00" : pad(value)}</p>
            <p className="mt-3 font-body text-[11px] font-semibold tracking-[0.3em] text-inv-ink/60 uppercase">{label}</p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
