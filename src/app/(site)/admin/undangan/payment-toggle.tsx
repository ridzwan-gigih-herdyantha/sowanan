"use client";

import { useState, useTransition } from "react";
import { Dropdown } from "../dropdown";
import { OFFLINE } from "../use-working";
import { setPaymentStatus } from "./actions";

const OPTIONS = [
  { value: "lunas", label: "Lunas" },
  { value: "belum", label: "Belum lunas" },
];

// Bentuknya sama dengan pilihan paket supaya jelas bisa diubah. Belum lunas diberi warna kuning karena perlu ditagih.
export function PaymentToggle({ slug, paid: initial }: { slug: string; paid: boolean }) {
  const [paid, setPaid] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <span className="inline-flex flex-col">
      <Dropdown
        value={paid ? "lunas" : "belum"}
        disabled={pending}
        label={`Pembayaran ${slug}`}
        size="sm"
        tone={paid ? "default" : "warn"}
        options={OPTIONS}
        onChange={(next) => {
          const toPaid = next === "lunas";
          if (!confirm(toPaid ? `Tandai ${slug} sudah lunas? Watermark SOWANAN.COM akan hilang.` : `Kembalikan ${slug} ke belum lunas? Watermark akan tampil lagi.`)) return;
          start(async () => {
            const res = await setPaymentStatus(slug, toPaid).catch(() => ({ ok: false as const, error: OFFLINE }));
            if (res.ok) {
              setPaid(toPaid);
              setError("");
            } else setError(res.error);
          });
        }}
      />
      {pending && <span className="mt-1 text-[11px] text-ink-mute">Menyimpan...</span>}
      {error && <span className="mt-1 max-w-48 text-[11px] text-wine">{error}</span>}
    </span>
  );
}
