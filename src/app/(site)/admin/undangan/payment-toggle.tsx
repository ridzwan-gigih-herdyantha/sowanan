"use client";

import { useState, useTransition } from "react";
import { setPaymentStatus } from "./actions";

export function PaymentToggle({ slug, paid: initial }: { slug: string; paid: boolean }) {
  const [paid, setPaid] = useState(initial);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const toggle = () => {
    const next = !paid;
    if (!confirm(next ? `Tandai ${slug} sudah lunas? Watermark BELUM AKTIF akan hilang.` : `Kembalikan ${slug} ke belum lunas? Watermark akan tampil lagi.`)) return;
    start(async () => {
      const res = await setPaymentStatus(slug, next);
      if (res.ok) {
        setPaid(next);
        setError("");
      } else setError(res.error);
    });
  };

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        title={paid ? "Klik untuk kembalikan ke belum lunas" : "Klik untuk tandai lunas"}
        className={`rounded-full px-2.5 py-0.5 text-[12px] transition-colors duration-150 disabled:opacity-50 ${
          paid ? "bg-ivory text-ink-soft ring-1 ring-line hover:ring-wine" : "bg-amber-100 text-amber-900 ring-1 ring-amber-300 hover:ring-amber-500"
        }`}
      >
        {pending ? "Menyimpan..." : paid ? "Lunas" : "Belum lunas"}
      </button>
      {error && <span className="mt-1 max-w-48 text-right text-[11px] text-wine">{error}</span>}
    </span>
  );
}
