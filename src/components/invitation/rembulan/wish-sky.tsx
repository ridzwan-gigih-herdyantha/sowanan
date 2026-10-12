"use client";

import { useMemo, useState } from "react";
import type { Wish } from "@/lib/guestbook";

const MAX = 120;
const frac = (n: number) => n - Math.floor(n);

// Ucapan sebagai langit: setiap ucapan satu bintang, dan bintang baru tersambung ke bintang terdekat yang lebih dulu ada,
// jadi lama-lama membentuk rasi. Posisi memakai deret berjarak rata supaya bintang tidak menumpuk dan tidak berpindah
// saat ucapan baru masuk.
export function WishSky({ wishes, fresh }: { wishes: readonly Wish[]; fresh: ReadonlySet<string> }) {
  const stars = useMemo(() => {
    const oldest = [...wishes].slice(0, MAX).reverse();
    const pts = oldest.map((w, i) => ({
      w,
      x: 6 + frac(0.5 + i * 0.7548776662) * 88,
      y: 10 + frac(0.5 + i * 0.5698402910) * 80,
      r: 1.6 + Math.min(1, w.message.length / 180) * 1.6,
    }));
    const links = pts.slice(1).map((p, i) => {
      let near = pts[0];
      let best = Infinity;
      for (const q of pts.slice(0, i + 1)) {
        const d = (q.x - p.x) ** 2 + ((q.y - p.y) * 0.6) ** 2;
        if (d < best) {
          best = d;
          near = q;
        }
      }
      return { a: near, b: p };
    });
    return { pts, links };
  }, [wishes]);

  const [picked, setPicked] = useState<string | null>(null);
  // Sorotan baru muncul setelah bintang diketuk, supaya tidak mengulang ucapan teratas di daftar.
  const shown = wishes.find((w) => w.id === picked);
  if (!wishes.length) {
    return (
      <div className="mb-10 grid aspect-[4/3] place-items-center rounded-sm border border-inv-line bg-inv-night px-6 text-center sm:aspect-video">
        <p className="font-display text-[22px] leading-snug text-inv-ink/80">Langit ini masih kosong. Jadilah bintang pertama.</p>
      </div>
    );
  }

  return (
    <figure className="mb-10">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-inv-line bg-inv-night sm:aspect-[16/9]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
          {stars.links.map(({ a, b }) => (
            <line key={b.w.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} vectorEffect="non-scaling-stroke" className="stroke-inv-gold-light" strokeWidth="0.75" />
          ))}
        </svg>
        {stars.pts.map(({ w, x, y, r }, i) => {
          const on = shown?.id === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setPicked(w.id)}
              aria-label={`Ucapan dari ${w.name}`}
              aria-pressed={on}
              className="group absolute -translate-x-1/2 -translate-y-1/2 p-2.5 focus-visible:outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={`block rounded-full bg-inv-ink transition-[transform,box-shadow] duration-500 group-hover:scale-150 group-focus-visible:scale-150 ${fresh.has(w.id) ? "motion-safe:animate-[rb-born_1.2s_cubic-bezier(.22,.61,.36,1)]" : "motion-safe:animate-[rb-twinkle_3.6s_ease-in-out_infinite]"} ${on ? "scale-150 shadow-[0_0_10px_3px_var(--inv-accent)]" : "shadow-[0_0_6px_1px_color-mix(in_srgb,var(--inv-ink)_50%,transparent)]"}`}
                style={{ width: r * 2, height: r * 2, animationDelay: `${(i % 9) * -0.4}s` }}
              />
            </button>
          );
        })}
        <p className="rb-label absolute bottom-3 left-4 text-[10px] tracking-[0.24em] text-inv-gold">
          {wishes.length} bintang dari tamu
        </p>
      </div>
      {shown ? (
        <figcaption key={shown.id} className="mt-5 motion-safe:animate-[inv-pop_.3s_ease-out]">
          <p className="font-display text-[22px] leading-snug text-inv-ink">&ldquo;{shown.message}&rdquo;</p>
          <p className="rb-label mt-3 text-[11px] tracking-[0.22em] text-inv-gold">{shown.name}</p>
        </figcaption>
      ) : (
        <figcaption className="mt-4 text-[14px] text-inv-gold italic">Ketuk salah satu bintang untuk membaca ucapannya.</figcaption>
      )}
    </figure>
  );
}
