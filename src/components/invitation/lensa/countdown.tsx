"use client";

import { pad, useTimeLeft } from "@/components/countdown";

// Hitung mundur Lensa: tiga kolom sama lebar dengan angka lebar dan tebal. Ukuran angka mengikuti lebar layar,
// jadi angka tiga digit tetap muat di HP.
export function LensaCountdown({ target }: { target: string }) {
  const t = useTimeLeft(target);
  const big = "font-display font-extrabold leading-[0.86] tabular-nums [font-stretch:112%]";

  if (t?.done) return <p className={`${big} text-[clamp(56px,16vw,200px)] uppercase`}>Hari ini</p>;

  const cells = [
    [t?.days, "Hari"],
    [t?.hours, "Jam"],
    [t?.minutes, "Menit"],
  ] as const;

  return (
    <div role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"} className="grid grid-cols-[1.4fr_1fr_1fr] border-t border-current/25">
      {cells.map(([value, label], i) => (
        <div key={label} className={`min-w-0 pt-5 ${i > 0 ? "border-l border-current/25 pl-[3vw]" : ""}`}>
          <p className={`${big} text-[clamp(40px,9.6vw,136px)]`}>{value === undefined ? "00" : pad(value)}</p>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.26em] uppercase opacity-60">{label}</p>
        </div>
      ))}
    </div>
  );
}
