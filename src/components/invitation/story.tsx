"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Modal } from "./modal";

export type StoryItem = {
  title: string;
  date: string;
  image: string;
  short: string;
  long: string;
  video?: { src: string; poster: string };
  no?: string;
  place?: string;
};

const sheetTilt = [-1.2, 0.8, -0.6, 1.1];

type StoryProps = {
  items: readonly StoryItem[];
  variant?: "arch" | "sheets" | "film";
  lead?: ReactNode;
  tail?: ReactNode;
};

export function Story({ items, variant = "arch", lead, tail }: StoryProps) {
  const [active, setActive] = useState<number | null>(null);
  const item = active === null ? null : items[active];

  return (
    <>
      {variant === "film" ? (
        <div className="film-scroller snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
          <ol className="film-track">
            {lead && <li className="film-card snap-start">{lead}</li>}
            {items.map((s, i) => (
              <li key={s.title} className="film-frame snap-start">
                <span className="film-code" aria-hidden="true">
                  {12 + i}A &#9656; {s.date}
                </span>
                <button type="button" onClick={() => setActive(i)} className="group relative block w-full flex-1 overflow-hidden text-left">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(min-width: 980px) 420px, 90vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-inv-paper sm:p-5">
                    <span className="block font-display text-[clamp(24px,6vw,32px)] leading-tight">{s.title}</span>
                    <span className="mt-1 block text-[13px] leading-snug text-inv-paper/80">{s.short}</span>
                    <span className="mt-3 inline-block border-b border-inv-gold-light pb-0.5 text-[11px] tracking-[0.18em] text-inv-gold-light">
                      PUTAR ADEGAN
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {tail && <li className="film-card snap-start">{tail}</li>}
          </ol>
        </div>
      ) : variant === "sheets" ? (
        <ol className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {items.map((s, i) => (
            <li key={s.title} style={{ rotate: `${sheetTilt[i % sheetTilt.length]}deg` }}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="relative flex w-full gap-4 border border-inv-line bg-inv-wash p-3 pr-4 text-left shadow-[0_6px_16px_rgba(0,0,0,.07)] transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="inv-tape -top-2.5 left-6 -rotate-3" aria-hidden="true" />
                <span className="relative aspect-[4/5] w-[38%] shrink-0 overflow-hidden">
                  <Image src={s.image} alt="" fill sizes="(min-width: 980px) 200px, 36vw" className="object-cover" />
                </span>
                <span className="flex flex-col py-1">
                  {s.no && <span className="text-[10px] font-medium tracking-[0.2em] text-inv-gold">No. {s.no}</span>}
                  <span className="mt-1 font-display text-[22px] leading-tight text-inv-accent">{s.title}</span>
                  <span className="mt-1 text-[12px] text-inv-ink/65">
                    {s.date}
                    {s.place && `, ${s.place}`}
                  </span>
                  <span className="mt-2 text-[14px] leading-snug">{s.short}</span>
                  <span className="mt-auto pt-3 text-[11px] font-medium tracking-[0.2em] text-inv-accent underline underline-offset-4">
                    BUKA LEMBAR
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
      <ol className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0">
        {items.map((s, i) => (
          <li key={s.title} className="w-[64vw] max-w-[260px] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <button type="button" onClick={() => setActive(i)} className="group block w-full text-left">
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-inv-wash">
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 980px) 240px, 64vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-4 text-[11px] tracking-[0.22em] text-inv-gold">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 font-display text-[22px] leading-tight text-inv-accent">{s.title}</p>
              <p className="mt-0.5 text-[13px] text-inv-ink/60">{s.date}</p>
              <p className="mt-2 text-[14px] leading-relaxed">{s.short}</p>
              <span className="mt-3 inline-block border-b border-inv-line pb-0.5 text-[12px] tracking-[0.12em] text-inv-accent">
                BACA CERITANYA
              </span>
            </button>
          </li>
        ))}
      </ol>
      )}

      <Modal open={item !== null} onClose={() => setActive(null)} label={item?.title ?? "Cerita"}>
        {item && (
          <article>
            <div className="relative aspect-[3/4] w-full bg-inv-night">
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
              <p className="text-[12px] tracking-[0.22em] text-inv-gold">{item.date}</p>
              <h3 className="mt-2 font-display text-4xl text-inv-accent">{item.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed">{item.long}</p>
            </div>
          </article>
        )}
      </Modal>
    </>
  );
}
