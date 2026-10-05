"use client";

import { useState, useTransition } from "react";
import { PACKAGE_NAMES, type PackageId, type Settings } from "@/lib/settings/schema";
import { formatRupiah, type Purchased } from "@/lib/settings/text";
import { setAddons } from "../actions";
import { Spinner } from "./spinner";

type Addon = Settings["addons"][number];
type Props = {
  slug: string;
  pkg: string | null;
  packages: Settings["packages"];
  addons: Settings["addons"];
  bought: Purchased;
  dp: number;
  onChange: (next: Purchased) => void;
};

const MAX_UNITS = 20;

// Paket undangan, add-on yang sudah dibayar, dan rincian harganya.
// Add-on yang disembunyikan di pengaturan tetap tampil kalau undangan ini sudah membelinya.
export function AddonPanel({ slug, pkg, packages, addons, bought, dp, onChange }: Props) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const id = pkg && pkg in PACKAGE_NAMES ? (pkg as PackageId) : null;
  const shown = addons.filter((a) => a.on || (bought[a.id] ?? 0) > 0);
  const unlocking = shown.filter((a) => a.unlock);
  const others = shown.filter((a) => !a.unlock);

  const save = (next: Purchased) => {
    const prev = bought;
    onChange(next);
    setError("");
    start(async () => {
      // Koneksi putus membuat aksi server melempar error. Ditangkap supaya editor tidak ikut jatuh.
      const res = await setAddons(slug, next).catch(() => ({ ok: false as const, error: "Add-on gagal tersimpan. Cek koneksi lalu coba lagi." }));
      if (!res.ok) {
        onChange(prev);
        setError(res.error);
      }
    });
  };
  const setUnits = (addonId: string, n: number) => {
    const next = { ...bought };
    if (n > 0) next[addonId] = Math.min(MAX_UNITS, n);
    else delete next[addonId];
    save(next);
  };

  const lines = shown.filter((a) => (bought[a.id] ?? 0) > 0).map((a) => ({ a, units: bought[a.id], total: a.price * bought[a.id] }));
  const pkgPrice = id ? packages[id].price : 0;
  const total = pkgPrice + lines.reduce((n, l) => n + l.total, 0);
  const deposit = Math.round((total * dp) / 100);

  const row = (a: Addon) => {
    const units = bought[a.id] ?? 0;
    const multi = a.unlock === "galeri_foto";
    return (
      <li key={a.id} className="flex items-center gap-3 rounded-sm border border-line px-3 py-2 text-[14px]">
        {multi ? (
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
              <button type="button" disabled={pending || units >= MAX_UNITS} onClick={() => setUnits(a.id, units + 1)} aria-label={`Tambah ${a.name}`} className="size-7 rounded-sm border border-line disabled:opacity-40">
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
  };

  return (
    <section className="rounded-sm border border-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-serif text-xl">Paket</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${id ? "bg-blush text-wine" : "bg-amber-100 text-amber-900 ring-1 ring-amber-300"}`}>{id ? PACKAGE_NAMES[id] : "Belum dipilih"}</span>
        {pending && <Spinner className="size-3.5 text-wine" />}
        <span className="ml-auto text-[12px] text-ink-mute">Ganti paket di daftar undangan</span>
      </div>

      {!id ? (
        <p className="mt-2 text-[13px] text-ink-mute">Isian tidak dibatasi paket. Pilih paket di daftar undangan supaya batas foto, musik, gaya, dan total harga ikut dihitung.</p>
      ) : (
        <>
          {shown.length > 0 && (
            <fieldset className="mt-3 border-t border-line pt-3">
              <legend className="sr-only">Add-on yang sudah dibayar</legend>
              {unlocking.length > 0 && (
                <>
                  <p className="mb-2 text-[13px] text-ink-mute">Membuka isian di luar paket</p>
                  <ul className="grid gap-2 sm:grid-cols-2">{unlocking.map(row)}</ul>
                </>
              )}
              {others.length > 0 && (
                <>
                  <p className={`mb-2 text-[13px] text-ink-mute ${unlocking.length ? "mt-3" : ""}`}>Lainnya</p>
                  <ul className="grid gap-2 sm:grid-cols-2">{others.map(row)}</ul>
                </>
              )}
              {error && <p className="mt-2 text-[13px] text-wine">{error}</p>}
            </fieldset>
          )}

          <dl className="mt-3 grid gap-1 border-t border-line pt-3 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt>Paket {PACKAGE_NAMES[id]}</dt>
              <dd className="tabular-nums">{formatRupiah(pkgPrice)}</dd>
            </div>
            {lines.map(({ a, units, total: t }) => (
              <div key={a.id} className="flex justify-between gap-4 text-ink-soft">
                <dt className="min-w-0">
                  {a.name}
                  {units > 1 && <span className="text-ink-mute"> x{units}</span>}
                </dt>
                <dd className="tabular-nums">{formatRupiah(t)}</dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-4 border-t border-line pt-2 font-medium">
              <dt>Total</dt>
              <dd className="font-serif text-xl tabular-nums" aria-live="polite">
                {formatRupiah(total)}
              </dd>
            </div>
{dp > 0 && (
  <div className="flex justify-between gap-4 text-[13px] text-ink-mute">
    <dt>Uang muka {dp}%</dt>
    <dd className="tabular-nums">
      {dp < 100
        ? `${formatRupiah(deposit)}, sisa ${formatRupiah(total - deposit)}`
        : "Harus lunas"}
    </dd>
  </div>
)}
          </dl>
        </>
      )}
    </section>
  );
}
