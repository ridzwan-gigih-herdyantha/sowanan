"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";
import type { StoryItem } from "./story";

export function Timeline({ items, variant = "line" }: { items: readonly StoryItem[]; variant?: "line" | "stack" }) {
  const [active, setActive] = useState<number | null>(null);
  const item = active === null ? null : items[active];

  return (
    <>
      {variant === "stack" ? (
        <ol>
          {items.map((s, i) => {
            const dark = i % 2 === 1;
            return (
              <li
                key={s.title}
                className="sticky top-0 h-[100svh] overflow-hidden shadow-[0_-24px_48px_rgba(0,0,0,.28)]"
                style={{ zIndex: i + 1 }}
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={`group relative block size-full text-left lg:grid lg:grid-cols-[5fr_7fr] ${dark ? "bg-inv-night" : "bg-inv-paper"}`}
                  aria-label={`Buka cerita ${s.title}`}
                >
                  <span className="absolute inset-0 lg:relative lg:order-2">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(min-width: 980px) 58vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent lg:hidden" aria-hidden="true" />
                  </span>
                  <span
                    className={`absolute inset-x-0 bottom-0 flex flex-col px-5 pb-10 text-white sm:px-8 lg:relative lg:order-1 lg:h-full lg:justify-center lg:px-14 lg:pb-0 ${
                      dark ? "lg:text-[#E8E5E0]" : "lg:text-inv-ink"
                    }`}
                  >
                    <span className="text-[11px] font-medium tracking-[0.24em] opacity-80">
                      {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                    <span
                      className={`mt-2 font-display text-[clamp(96px,30vw,200px)] leading-[0.85] tracking-[-0.03em] text-transparent italic [--stroke:#fff] ${
                        dark ? "lg:[--stroke:#E8E5E0]" : "lg:[--stroke:#121212]"
                      }`}
                      style={{ WebkitTextStroke: "1.5px var(--stroke)" }}
                    >
                      {s.date.slice(-4)}
                    </span>
                    <span className="mt-4 font-display text-[clamp(34px,9vw,56px)] leading-[1.02]">{s.title}</span>
                    <span className="mt-3 max-w-[34ch] text-[15px] leading-relaxed opacity-85">{s.short}</span>
                    <span className="mt-6 inline-flex w-fit items-center gap-3 border-b border-current pb-1 text-[11px] font-medium tracking-[0.24em]">
                      BACA CERITANYA
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M4 12h16M14 6l6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
      <ol className="ml-1 border-l border-inv-line lg:ml-0 lg:grid lg:grid-cols-4 lg:border-t lg:border-l-0">
        {items.map((s, i) => (
          <li key={s.title} className="relative pb-12 pl-8 last:pb-0 lg:pt-10 lg:pr-8 lg:pb-0 lg:pl-0">
            <span className="absolute top-3 -left-[5px] size-[9px] bg-inv-ink lg:-top-[5px] lg:left-0" aria-hidden="true" />
            <p className="font-display text-[56px] leading-none">{s.date.slice(-4)}</p>
            <p className="mt-3 text-[11px] font-medium tracking-[0.24em] text-inv-gold">{s.title.toUpperCase()}</p>
            <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed">{s.short}</p>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="mt-4 border-b border-inv-ink pb-0.5 text-[11px] font-medium tracking-[0.24em]"
            >
              LIHAT MOMEN
            </button>
          </li>
        ))}
      </ol>
      )}

      <Modal open={item !== null} onClose={() => setActive(null)} label={item?.title ?? "Cerita"}>
        {item && (
          <article>
            <div className="relative aspect-[4/5] w-full bg-inv-night">
              {item.video ? (
                <video
                  src={item.video.src}
                  poster={item.video.poster}
                  className="size-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                />
              ) : (
                <Image src={item.image} alt="" fill quality={85} sizes="(min-width: 560px) 512px, 100vw" className="object-cover" />
              )}
            </div>
            <div className="px-6 pt-6 pb-8">
              <p className="text-[11px] font-medium tracking-[0.24em] text-inv-gold">{item.date}</p>
              <h3 className="mt-2 font-display text-4xl">{item.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed">{item.long}</p>
            </div>
          </article>
        )}
      </Modal>
    </>
  );
}
