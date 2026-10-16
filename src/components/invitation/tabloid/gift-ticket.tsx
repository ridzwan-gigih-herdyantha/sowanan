"use client";

import { useState } from "react";

// Tiket kado. Saat nomor rekening disalin, sobekan kuningnya robek di garis putus lalu jatuh, dan sobekan baru
// muncul kembali setelah tulisan tersalin hilang.
export function GiftTicket({ bank, number, holder, className = "" }: { bank: string; number: string; holder: string; className?: string }) {
  const [torn, setTorn] = useState(0);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(number.replace(/\s/g, ""));
    } catch {
      return;
    }
    setCopied(true);
    setTorn((t) => t + 1);
    setTimeout(() => setCopied(false), 2400);
  }

  return (
    <div className={`flex ${className}`}>
      <div className="flex-1 rounded-l-[10px] border-[3px] border-inv-ink bg-inv-card [border-right-style:dashed] px-5 py-4 shadow-[5px_5px_0_var(--inv-ink)]">
        <p className="tp-label text-[15px] text-inv-accent">{bank}</p>
        <p className="tp-type mt-1 text-[22px] text-inv-ink">{number}</p>
        <p className="mt-1 text-[14px] text-inv-ink/80">a.n. {holder}</p>
        <button type="button" onClick={copy} aria-label={`Salin nomor rekening ${holder}`} className="tp-pill tp-label mt-3 px-4! py-1.5! text-[15px]">
          <span aria-live="polite">{copied ? "Tersalin!" : "Salin"}</span>
        </button>
      </div>
      <div
        key={torn}
        aria-hidden="true"
        className={`tp-label grid w-12 place-items-center rounded-r-[10px] border-[3px] border-l-0 border-inv-ink bg-(--tp-sun) text-[15px] text-inv-ink shadow-[5px_5px_0_var(--inv-ink)] [writing-mode:vertical-rl] ${torn ? "tp-tear" : ""}`}
      >
        Kado
      </div>
    </div>
  );
}
