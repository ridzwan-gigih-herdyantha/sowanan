"use client";

import { useState, type ReactNode } from "react";
import { Dropdown } from "@/app/(site)/admin/dropdown";

type Item = { id: string; category: string; node: ReactNode };

const LIMIT = 4;

// Daftar tema ringkas di beranda: kategori dipilih dari dropdown, paling banyak empat tema per kategori, lalu
// tautan ke halaman tema dengan kategori yang sama untuk melihat sisanya.
export function ThemePicker({ items, categories, waHref }: { items: Item[]; categories: [string, string][]; waHref: string }) {
  const [picked, setPicked] = useState("");
  const count = (k: string) => items.filter((it) => !k || it.category === k).length;
  const label = categories.find(([k]) => k === picked)?.[1] ?? "";
  const shown = items.filter((it) => !picked || it.category === picked);
  const visible = new Set(shown.slice(0, LIMIT).map((it) => it.id));
  const more = shown.length - visible.size;
  const href = picked ? `/tema?kategori=${picked}` : "/tema";

  return (
    <>
      <Dropdown
        label="Kategori"
        prefix
        placement="down"
        value={picked}
        onChange={setPicked}
        options={[{ value: "", label: `Semua tema (${count("")})` }, ...categories.map(([k, name]) => ({ value: k, label: `${name} (${count(k)})` }))]}
        className="mb-8 w-[min(100%,260px)]"
      />
      {/* Kartu disembunyikan, bukan dicabut, supaya animasi muncul saat digulir tetap jalan ketika kategori diganti. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.id} hidden={!visible.has(it.id)}>
            {it.node}
          </div>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line px-5 py-8 text-center text-[15px] text-ink-soft">
          Tema {label} sedang kami siapkan.{" "}
          <a href={waHref} className="text-wine underline underline-offset-4">
            Kirim contoh yang kalian suka lewat WhatsApp
          </a>
          , kami bisa buatkan lebih dulu.
        </p>
      ) : (
        <div className="mt-10 flex justify-center">
          <a href={href} className="inline-flex items-center gap-2 rounded-sm border border-wine px-6 py-3 text-[15px] text-wine no-underline transition-colors duration-200 hover:bg-wine hover:text-white">
            {more > 0 ? `Lihat ${more} tema ${label || "lainnya"}` : `Lihat semua tema${label ? ` ${label}` : ""}`}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      )}
    </>
  );
}
