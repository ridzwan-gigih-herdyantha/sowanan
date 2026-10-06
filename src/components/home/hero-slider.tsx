"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cx } from "@/components/ui";

export type HeroSlide = { name: string; style: string; image: string; href: string };

const INTERVAL = 3000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(() => new Set([0, 1]));
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduce = useReducedMotion();
  const n = slides.length;
  const auto = n > 1 && !reduce && !stopped && !hover;

  const go = (i: number) => {
    const next = (i + n) % n;
    setIndex(next);
    setSeen((s) => (s.has(next) && s.has((next + 1) % n) ? s : new Set([...s, next, (next + 1) % n])));
  };

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
    // go hanya membaca n dan setter, cukup dipicu oleh index dan status auto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, index]);

  if (!n) return null;
  const current = slides[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Contoh tema undangan"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
      }}
      className="mx-auto w-full max-w-[300px] flex-none md:mx-0 md:w-[clamp(220px,calc((100svh-290px)*0.462),260px)] lg:w-[clamp(220px,calc((100svh-290px)*0.462),300px)]"
    >
      <a
        href={current.href}
        aria-label={`Buka contoh tema ${current.name}`}
        className="group block rounded-[36px] bg-ink p-3 shadow-[0_18px_40px_rgba(31,26,23,.22)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-wine motion-reduce:transform-none"
      >
        <div className="relative aspect-[390/844] overflow-hidden rounded-[26px] bg-blush">
          {slides.map((s, i) =>
            seen.has(i) ? (
              <Image
                key={s.image}
                src={s.image}
                alt={i === index ? `Contoh undangan tema ${s.name}` : ""}
                aria-hidden={i !== index}
                fill
                priority={i === 0}
                sizes="(min-width: 980px) 300px, (min-width: 760px) 260px, 300px"
                className={cx("object-cover object-top transition-opacity duration-500 ease-out motion-reduce:transition-none", i === index ? "opacity-100" : "opacity-0")}
              />
            ) : null,
          )}
        </div>
      </a>

      <div className="mt-3.5 flex flex-col items-center gap-1.5 text-center">
        {/* <p aria-live={auto ? "off" : "polite"} className="w-full min-w-0">
          <span className="block truncate font-serif text-xl leading-tight">{current.name}</span>
          {current.style && <span className="block truncate text-[14px] text-ink-mute">{current.style}</span>}
        </p> */}
        {n > 1 && (
          <div className="flex flex-none items-center gap-1">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                onClick={() => go(i)}
                aria-label={`Tampilkan tema ${s.name}`}
                aria-current={i === index ? "true" : undefined}
                className="flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-wine"
              >
                <span className={cx("block size-1.5 rounded-full transition-[transform,background-color] duration-200 motion-reduce:transition-none", i === index ? "scale-[1.7] bg-wine" : "bg-wine-soft")} />
              </button>
            ))}
            {!reduce && (
              <button
                type="button"
                onClick={() => setStopped((v) => !v)}
                aria-label={stopped ? "Putar slide otomatis" : "Jeda slide otomatis"}
                className="ml-1 flex size-7 items-center justify-center rounded-full border border-line text-ink-soft transition-colors duration-150 hover:border-wine hover:text-wine focus-visible:outline-2 focus-visible:outline-wine"
              >
                <svg viewBox="0 0 12 12" aria-hidden="true" className="size-2.5 fill-current">
                  {stopped ? <path d="M3 1.5l7 4.5-7 4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
