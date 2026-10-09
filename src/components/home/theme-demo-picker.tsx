"use client";

import { useState } from "react";

type Option = { id: string; name: string; href: string; available: boolean; note?: string };

// Pilihan paket di kartu tema. Tombol Lihat demo membuka undangan contoh sesuai paket yang dipilih.
// Tombol itu juga menjadi tautan seluruh kartu lewat after:inset-0, jadi pilihan paket diletakkan di atasnya (z-20).
export function ThemeDemoPicker({ name, options, initial }: { name: string; options: Option[]; initial: string }) {
  const [picked, setPicked] = useState(initial);
  const current = options.find((o) => o.id === picked && o.available) ?? options.find((o) => o.available);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label={`Paket untuk demo ${name}`} className="relative z-20 inline-flex rounded-full border border-line bg-white/70 p-0.5 text-[12px]">
        {options.map((o) => {
          const on = o.id === current?.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={!o.available}
              title={o.note}
              onClick={() => setPicked(o.id)}
              className={`rounded-full px-2.5 py-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-wine disabled:cursor-not-allowed disabled:text-ink-mute/50 ${
                on ? "bg-wine text-white" : "text-ink-soft hover:text-wine"
              }`}
            >
              {o.name}
              {o.note && <span className="sr-only">, {o.note}</span>}
            </button>
          );
        })}
      </div>
      {current && (
        <a
          href={current.href}
          aria-label={`Lihat demo tema ${name} paket ${current.name}`}
          className="inline-flex flex-none items-center rounded-sm border border-wine px-4 py-2 text-[15px] text-wine no-underline transition-colors duration-200 group-hover:bg-wine group-hover:text-white after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine motion-reduce:transition-none"
        >
          Lihat demo
        </a>
      )}
    </div>
  );
}
