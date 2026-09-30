"use client";

import { useState, useTransition } from "react";
import { setPackage } from "./actions";

const OPTIONS = [
  ["", "Belum dipilih"],
  ["dasar", "Dasar"],
  ["lengkap", "Lengkap"],
  ["istimewa", "Istimewa"],
] as const;

export function PackageSelect({ slug, value: initial }: { slug: string; value: string }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <span className="inline-flex flex-col">
      <select
        value={value}
        disabled={pending}
        aria-label={`Paket ${slug}`}
        onChange={(e) => {
          const next = e.target.value;
          const prev = value;
          setValue(next);
          start(async () => {
            const res = await setPackage(slug, next);
            if (res.ok) setError("");
            else {
              setValue(prev);
              setError(res.error);
            }
          });
        }}
        className={`rounded-sm border bg-white px-2 py-1.5 text-[14px] outline-none focus:border-wine disabled:opacity-50 ${value ? "border-line" : "border-dashed border-ink-mute text-ink-mute"}`}
      >
        {OPTIONS.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 max-w-48 text-[11px] text-wine">{error}</span>}
    </span>
  );
}
