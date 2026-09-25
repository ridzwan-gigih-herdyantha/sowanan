"use client";

import { useState, type ReactNode } from "react";

export function FlipCard({ front, back, label, className = "" }: { front: ReactNode; back: ReactNode; label: string; className?: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `Balik ke foto ${label}` : `Balik kartu ${label}`}
      className={`block w-full text-left [perspective:1400px] ${className}`}
    >
      <span
        className="grid transition-transform duration-700 ease-[cubic-bezier(.22,.61,.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        <span className="[grid-area:1/1] [backface-visibility:hidden]">{front}</span>
        <span className="[grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</span>
      </span>
    </button>
  );
}
