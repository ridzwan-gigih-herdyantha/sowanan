"use client";

import { pad, useTimeLeft } from "@/components/countdown";

// Hitung mundur seperti papan jadwal keping balik: angka mustard di keping hitam dengan garis lipat di tengah.
export function TabloidCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);

  if (t?.done) return <p className="tp-offset font-display text-center text-[clamp(44px,12vw,64px)] text-inv-ink">Hari ini!</p>;

  const cells = [
    [t?.days, "Hari"],
    [t?.hours, "Jam"],
    [t?.minutes, "Menit"],
  ] as const;

  return (
    <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="flex justify-center gap-3 sm:gap-5">
      {cells.map(([value, label]) => (
        <div key={label} className="text-center">
          <p className="tp-flip tp-label text-[clamp(44px,13vw,64px)] leading-none tabular-nums">{value === undefined ? "00" : pad(value)}</p>
          <p className="tp-label mt-2 text-[15px] text-inv-ink">{label}</p>
        </div>
      ))}
    </div>
  );
}
