"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Salin ${label}`}
      className="rounded-sm border border-inv-accent px-4 py-2 text-[12px] tracking-[0.14em] text-inv-accent transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper"
    >
      <span aria-live="polite">{copied ? "TERSALIN" : "SALIN"}</span>
    </button>
  );
}
