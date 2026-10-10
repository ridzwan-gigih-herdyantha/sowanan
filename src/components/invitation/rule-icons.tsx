import type { ReactNode } from "react";
import type { RuleIcon } from "@/lib/invitation/schema";

// Ikon garis untuk imbauan tamu. Warnanya mengikuti warna teks supaya serasi di semua tema.
const PATHS: Record<RuleIcon, ReactNode> = {
  umum: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.8" r=".6" fill="currentColor" />
    </>
  ),
  kamera: (
    <>
      <path d="M3 8.5h3.5L8.5 6h7l2 2.5H21V19H3z" />
      <circle cx="12" cy="13.2" r="3.3" />
      <path d="M4 4l16 16" />
    </>
  ),
  ponsel: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
      <path d="M4 4l16 16" />
    </>
  ),
  anak: (
    <>
      <circle cx="12" cy="5" r="2.3" />
      <path d="M12 8.5v6M7.5 10.5 12 12l4.5-1.5M9.5 20.5l2.5-6 2.5 6" />
    </>
  ),
  waktu: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  pakaian: <path d="M9 3 3.5 6l2 4 2-1v11.5h9V9l2 1 2-4L15 3c-.4 1.6-1.6 2.6-3 2.6S9.4 4.6 9 3Z" />,
  hadiah: (
    <>
      <path d="M4.5 11h15v9.5h-15zM3 7.5h18V11H3zM12 7.5v13" />
      <path d="M12 7.5C10.5 4.5 7 4.2 7 6s3.2 1.5 5 1.5ZM12 7.5c1.5-3 5-3.3 5-1.5s-3.2 1.5-5 1.5Z" />
    </>
  ),
  parkir: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M10 16.5v-9h2.8a2.6 2.6 0 0 1 0 5.2H10" />
    </>
  ),
};

export function RuleIconSvg({ name, className = "size-5" }: { name: RuleIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      {PATHS[name] ?? PATHS.umum}
    </svg>
  );
}
