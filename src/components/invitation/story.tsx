"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";

export type StoryItem = {
  title: string;
  date: string;
  image: string;
  short: string;
  long: string;
  video?: { src: string; poster: string };
};

export function Story({ items }: { items: readonly StoryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const item = active === null ? null : items[active];

  return (
    <>
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
                <Image src={item.image} alt="" fill sizes="(min-width: 560px) 512px, 100vw" className="object-cover" />
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
