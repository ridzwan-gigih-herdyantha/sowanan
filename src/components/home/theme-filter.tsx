"use client";

import { useState, type ReactNode } from "react";

type Item = { id: string; category: string; node: ReactNode };

type Props = { items: Item[]; categories: [string, string][]; waHref: string; initial?: string; onPick?: (category: string) => void };

// Chip kategori di atas daftar tema. Kartu yang tidak cocok disembunyikan, bukan dicabut, supaya animasi
// muncul saat digulir tetap jalan ketika filter diganti. initial dan onPick dipakai halaman tema untuk
// menyimpan kategori di alamat halaman.
export function ThemeFilter({ items, categories, waHref, initial = "", onPick }: Props) {
  const [picked, setPicked] = useState(initial);
  const pick = (k: string) => {
    setPicked(k);
    onPick?.(k);
  };
  const label = categories.find(([k]) => k === picked)?.[1] ?? "";
  const shown = items.filter((it) => !picked || it.category === picked).length;
  const chips: [string, string][] = [["", "Semua"], ...categories];

  return (
    <>
      <div role="group" aria-label="Kategori tema" className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {chips.map(([k, name]) => (
          <button
            key={k || "semua"}
            type="button"
            aria-pressed={picked === k}
            onClick={() => pick(k)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-[14px] whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine ${
              picked === k ? "border-wine bg-wine text-white" : "border-line bg-white/60 text-ink-soft hover:border-wine hover:text-wine"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5">
        {items.map((it) => (
          <div key={it.id} hidden={Boolean(picked) && it.category !== picked}>
            {it.node}
          </div>
        ))}
      </div>
      {shown === 0 && (
        <p className="rounded-sm border border-dashed border-line px-5 py-8 text-center text-[15px] text-ink-soft">
          Tema {label} sedang kami siapkan.{" "}
          <a href={waHref} className="text-wine underline underline-offset-4">
            Kirim contoh yang kalian suka lewat WhatsApp
          </a>
          , kami bisa buatkan lebih dulu.
        </p>
      )}
    </>
  );
}
