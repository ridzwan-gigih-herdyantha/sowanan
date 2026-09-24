"use client";

import { pad, useTimeLeft } from "@/components/countdown";

type Props = { target: string; stacked?: boolean; doneText?: string };

export function BigCountdown({ target, stacked = false, doneText = "HARINYA SUDAH TIBA." }: Props) {
  const t = useTimeLeft(target);

  if (t?.done) {
    return <p className="font-display text-[clamp(56px,16vw,140px)] leading-[0.95] text-inv-gold-light">{doneText}</p>;
  }

  return (
    <div
      className={stacked ? "flex flex-col gap-6 lg:flex-row lg:gap-16" : "flex flex-wrap gap-x-10 gap-y-4"}
      role="timer"
      aria-label={t ? `${t.days} hari ${t.hours} jam lagi` : "Menghitung waktu"}
    >
      {[
        [t?.days, "HARI"],
        [t?.hours, "JAM"],
      ].map(([value, label]) => (
        <div key={label}>
          <p className={`font-display leading-[0.85] text-inv-gold-light tabular-nums ${stacked ? "text-[clamp(120px,40vw,280px)]" : "text-[clamp(96px,32vw,220px)]"}`}>
            {value === undefined ? "00" : pad(value as number)}
          </p>
          <p className="mt-2 text-[11px] tracking-[0.22em] opacity-70">{label}</p>
        </div>
      ))}
    </div>
  );
}
