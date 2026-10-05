"use client";

import { useState, useTransition } from "react";
import { PACKAGE_NAMES, type PackageId, type Settings } from "@/lib/settings/schema";
import { formatRupiah, type Purchased } from "@/lib/settings/text";
import { setAddons } from "../actions";
import { Spinner } from "./spinner";

type Props = { slug: string; pkg: string | null; addons: Settings["addons"]; bought: Purchased; onChange: (next: Purchased) => void };

// Paket undangan dan add-on yang sudah dibayar. Hanya add-on yang membuka isian editor yang ditampilkan.
export function AddonPanel({ slug, pkg, addons, bought, onChange }: Props) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const relevant = addons.filter((a) => a.unlock);
  const name = pkg && pkg in PACKAGE_NAMES ? PACKAGE_NAMES[pkg as PackageId] : null;

  const save = (next: Purchased) => {
    const prev = bought;
    onChange(next);
    setError("");
    start(async () => {
      const res = await setAddons(slug, next);
      if (!res.ok) {
        onChange(prev);
        setError(res.error);
      }
    });
  };
  const setUnits = (id: string, n: number) => {
    const next = { ...bought };
    if (n > 0) next[id] = Math.min(20, n);
    else delete next[id];
    save(next);
  };

  return (
    <section className="rounded-sm border border-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-serif text-xl">Paket</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${name ? "bg-blush text-wine" : "bg-amber-100 text-amber-900 ring-1 ring-amber-300"}`}>{name ?? "Belum dipilih"}</span>
        {pending && <Spinner className="size-3.5 text-wine" />}
        <span className="ml-auto text-[12px] text-ink-mute">Ganti paket di daftar undangan</span>
      </div>

      {!name ? (
        <p className="mt-2 text-[13px] text-ink-mute">Isian tidak dibatasi paket. Pilih paket di daftar undangan supaya batas foto, musik, dan gaya ikut diperiksa.</p>
      ) : relevant.length > 0 ? (
        <fieldset className="mt-3 border-t border-line pt-3">
          <legend className="sr-only">Add-on yang sudah dibayar</legend>
          <p className="mb-2 text-[13px] text-ink-mute">Add-on yang sudah dibayar membuka isian di luar paket.</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {relevant.map((a) => {
              const units = bought[a.id] ?? 0;
              return (
                <li key={a.id} className="flex items-center gap-3 rounded-sm border border-line px-3 py-2 text-[14px]">
                  {a.unlock === "galeri_foto" ? (
                    <>
                      <span className="min-w-0 flex-1">
                        {a.name}
                        <span className="block text-[12px] text-ink-mute">
                          {formatRupiah(a.price)} per unit, +{a.amount} foto
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <button type="button" disabled={pending || units === 0} onClick={() => setUnits(a.id, units - 1)} aria-label={`Kurangi ${a.name}`} className="size-7 rounded-sm border border-line disabled:opacity-40">
                          -
                        </button>
                        <span className="w-6 text-center tabular-nums" aria-live="polite">
                          {units}
                        </span>
                        <button type="button" disabled={pending || units >= 20} onClick={() => setUnits(a.id, units + 1)} aria-label={`Tambah ${a.name}`} className="size-7 rounded-sm border border-line disabled:opacity-40">
                          +
                        </button>
                      </span>
                    </>
                  ) : (
                    <label className="flex flex-1 cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={units > 0} disabled={pending} onChange={(e) => setUnits(a.id, e.target.checked ? 1 : 0)} className="size-4 accent-wine" />
                      <span className="min-w-0 flex-1">
                        {a.name}
                        <span className="block text-[12px] text-ink-mute">{formatRupiah(a.price)}</span>
                      </span>
                    </label>
                  )}
                </li>
              );
            })}
          </ul>
          {error && <p className="mt-2 text-[13px] text-wine">{error}</p>}
        </fieldset>
      ) : null}
    </section>
  );
}
