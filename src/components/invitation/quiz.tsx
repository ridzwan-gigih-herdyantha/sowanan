"use client";

import { useState } from "react";

const options = [
  { label: "Kenangan baik", reply: "Simpan baik-baik. Hari itu kita tambah satu lagi." },
  { label: "Hati yang lapang", reply: "Kalau begitu kamu datang ke tempat yang tepat." },
  { label: "Energi berlebih", reply: "Bagus. Lantai dansanya butuh kamu." },
  { label: "Jujur, demi makanannya", reply: "Kami hargai kejujuranmu. Prasmanan sudah menunggu." },
];

export function Quiz() {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      <div className="grid gap-3" role="radiogroup" aria-label="Kamu datang bawa apa?">
        {options.map((o, i) => {
          const active = picked === i;
          return (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPicked(i)}
              className={`rounded-sm border px-5 py-4 text-left text-[15px] tracking-[0.04em] transition-colors duration-150 ${
                active ? "border-inv-accent bg-inv-accent text-inv-paper" : "border-inv-line hover:border-inv-accent"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-8 min-h-[3.5em] font-display text-2xl leading-snug text-inv-accent italic">
        {picked !== null && (
          <span key={picked} className="inline-block animate-[inv-pop_.3s_ease-out]">
            {options[picked].reply}
          </span>
        )}
      </p>
    </div>
  );
}
