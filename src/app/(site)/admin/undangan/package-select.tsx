"use client";

import { useState, useTransition } from "react";
import { Dropdown } from "../dropdown";
import { OFFLINE } from "../use-working";
import { setPackage } from "./actions";

// Belum dipilih hanya muncul untuk undangan lama yang dibuat sebelum paket wajib dipilih.
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
      <Dropdown
        value={value}
        disabled={pending}
        label={`Paket ${slug}`}
        placeholder="Belum dipilih"
        size="sm"
        tone={value ? "default" : "empty"}
        options={OPTIONS.filter(([v]) => v || !initial).map(([v, label]) => ({ value: v, label, disabled: !v }))}
        onChange={(next) => {
          const prev = value;
          setValue(next);
          start(async () => {
            const res = await setPackage(slug, next).catch(() => ({ ok: false as const, error: OFFLINE }));
            if (res.ok) setError("");
            else {
              setValue(prev);
              setError(res.error);
            }
          });
        }}
      />
      {pending && <span className="mt-1 text-[11px] text-ink-mute">Menyimpan...</span>}
      {error && <span className="mt-1 max-w-48 text-[11px] text-wine">{error}</span>}
    </span>
  );
}
