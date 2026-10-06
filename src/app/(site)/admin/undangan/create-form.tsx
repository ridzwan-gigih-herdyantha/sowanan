"use client";

import { useActionState, useState } from "react";
import { Dropdown } from "../dropdown";
import { createInvitation, type CreateState } from "./actions";

type Theme = { key: string; name: string; packages: string[] };

// Paket dipilih dulu, lalu daftar tema hanya berisi tema yang tersedia di paket itu.
export function CreateForm({ packages, themes }: { packages: { id: string; name: string }[]; themes: Theme[] }) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createInvitation, {});
  const [pkg, setPkg] = useState("");
  const [theme, setTheme] = useState("");
  const available = themes.filter((t) => t.packages.includes(pkg));
  const chosen = available.some((t) => t.key === theme) ? theme : (available[0]?.key ?? "");

  return (
    <form action={action} className="grid gap-4 rounded-sm border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_200px_auto] lg:items-end">
      <label className="block text-[14px] font-medium sm:col-span-2 lg:col-span-1">
        Link undangan
        <span className={`mt-2 flex overflow-hidden rounded-sm border bg-white focus-within:border-wine ${state.error ? "border-wine" : "border-line"}`}>
          <span className="flex items-center bg-blush px-3 text-[14px] font-normal text-ink-mute">sowanan.com/</span>
          <input
            name="slug"
            required
            defaultValue={state.slug}
            placeholder="budi-ani"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            autoCapitalize="none"
            autoComplete="off"
            className="min-w-0 flex-1 px-3 py-2.5 text-base font-normal outline-none"
          />
        </span>
      </label>
      <div className="text-[14px] font-medium">
        <span aria-hidden="true">Paket</span>
        <Dropdown
          name="package"
          label="Paket"
          placeholder="Pilih paket"
          value={pkg}
          options={packages.map((p) => ({ value: p.id, label: p.name }))}
          onChange={setPkg}
          tone={pkg ? "default" : "empty"}
          className="mt-2"
        />
      </div>
      <div className="text-[14px] font-medium">
        <span aria-hidden="true">Tema</span>
        <Dropdown
          name="theme"
          label="Tema"
          placeholder={pkg ? "Pilih tema" : "Pilih paket dulu"}
          value={chosen}
          disabled={!pkg}
          options={available.map((t) => ({ value: t.key, label: t.name }))}
          onChange={setTheme}
          className="mt-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending || !pkg || !chosen}
        className="rounded-sm bg-wine px-5 py-3 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60 sm:col-span-2 lg:col-span-1"
      >
        {pending ? "Membuat..." : "Buat undangan"}
      </button>
      {state.error && <p className="text-[13px] text-wine sm:col-span-2 lg:col-span-4">{state.error}</p>}
      <p className="text-[13px] text-ink-mute sm:col-span-2 lg:col-span-4">
        Huruf kecil, angka, dan tanda hubung. Link tidak bisa diganti setelah disebar ke tamu.
        {/* {pkg && ` Paket ini bisa memakai ${available.length} dari ${themes.length} tema. Isian undangan menyesuaikan batas paketnya.`} */}
      </p>
    </form>
  );
}
