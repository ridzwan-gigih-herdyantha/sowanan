"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "./modal";
import type { StoryItem } from "./story";

export function Timeline({ items }: { items: readonly StoryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const item = active === null ? null : items[active];

  return (
    <>
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
