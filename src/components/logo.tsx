import { MARK_PATH, MARK_VIEWBOX } from "@/lib/brand";

// Tanda logo Sowanan. Warnanya mengikuti warna teks (currentColor).
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} aria-hidden="true" className={`shrink-0 ${className}`}>
      <path fill="currentColor" d={MARK_PATH} />
    </svg>
  );
}
