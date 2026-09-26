"use client";

import { useActionState } from "react";
import { createInvitation, type CreateState } from "./actions";

const input = "mt-2 block w-full rounded-sm border bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-wine";

export function CreateForm({ themes }: { themes: { key: string; name: string }[] }) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createInvitation, {});

  return (
    <form action={action} className="grid gap-4 rounded-sm border border-line bg-white p-4 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-end">
      <label className="block text-[14px] font-medium">
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
      <label className="block text-[14px] font-medium">
        Tema
        <select name="theme" required className={`${input} border-line`}>
          {themes.map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending} className="rounded-sm bg-wine px-5 py-3 text-[14px] text-white transition-colors duration-150 hover:bg-wine-dark disabled:opacity-60">
        {pending ? "Membuat..." : "Buat undangan"}
      </button>
      {state.error && <p className="text-[13px] text-wine sm:col-span-3">{state.error}</p>}
      <p className="text-[13px] text-ink-mute sm:col-span-3">Huruf kecil, angka, dan tanda hubung. Link tidak bisa diganti setelah disebar ke tamu.</p>
    </form>
  );
}
