"use client";

import { pad, useTimeLeft } from "@/components/countdown";

export function BigCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);

  if (t?.done) {
    return <p className="font-display text-[clamp(56px,16vw,140px)] leading-[0.95] text-inv-gold-light">HARINYA SUDAH TIBA.</p>;
  }

  return (
    <div
      className="flex flex-wrap gap-x-10 gap-y-4"
      role="timer"
      aria-label={t ? `${t.days} hari ${t.hours} jam lagi` : "Menghitung waktu"}
    >
      {[
        [t?.days, "HARI"],
        [t?.hours, "JAM"],
      ].map(([value, label]) => (
        <div key={label}>
          <p className="font-display text-[clamp(96px,32vw,220px)] leading-[0.85] text-inv-gold-light tabular-nums">
            {value === undefined ? "00" : pad(value as number)}
          </p>
          <p className="mt-2 text-[11px] tracking-[0.22em] text-inv-paper/70">{label}</p>
        </div>
      ))}
    </div>
  );
}
