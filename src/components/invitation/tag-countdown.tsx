"use client";

import { pad, useTimeLeft } from "@/components/countdown";

const tags = [
  { key: "days", label: "HARI", tone: "bg-inv-wash", tilt: -4, drop: "h-10" },
  { key: "hours", label: "JAM", tone: "bg-[#C6A9C4]", tilt: 3, drop: "h-20" },
  { key: "minutes", label: "MENIT", tone: "bg-[#B8C4A8]", tilt: -2, drop: "h-14" },
] as const;

export function TagCountdown({ target, doneText }: { target: string; doneText: string }) {
  const t = useTimeLeft(target);

  if (t?.done) {
    return <p className="font-display text-[clamp(48px,14vw,120px)] leading-none">{doneText}</p>;
  }

  return (
    <div className="relative" role="timer" aria-label={t ? `${t.days} hari ${t.hours} jam ${t.minutes} menit lagi` : "Menghitung waktu"}>
      <span className="absolute inset-x-0 top-0 h-px bg-inv-gold-light/60" aria-hidden="true" />
      <ul className="grid grid-cols-3 gap-3 sm:gap-8">
        {tags.map((tag) => (
          <li key={tag.key} className="flex flex-col items-center">
            <span className={`w-px bg-inv-gold-light/60 ${tag.drop}`} aria-hidden="true" />
            <span
              className="inv-swing relative block w-full max-w-[200px] origin-top"
              style={{ "--tilt": `${tag.tilt}deg` } as React.CSSProperties}
              tabIndex={0}
            >
              <span
                className={`relative block px-3 pt-8 pb-5 text-center text-inv-ink ${tag.tone} [clip-path:polygon(18%_0,82%_0,100%_14%,100%_100%,0_100%,0_14%)] sm:pt-10 sm:pb-7`}
              >
                <span className="absolute top-3 left-1/2 size-3 -translate-x-1/2 rounded-full bg-inv-night" aria-hidden="true" />
                <span className="block font-display text-[clamp(44px,13vw,104px)] leading-none tabular-nums">
                  {t ? pad(t[tag.key]) : "00"}
                </span>
                <span className="mt-2 block text-[10px] font-medium tracking-[0.2em]">{tag.label}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
