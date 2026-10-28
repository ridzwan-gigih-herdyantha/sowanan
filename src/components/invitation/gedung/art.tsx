const LINE = "var(--inv-line)";

// Dua karakter kecil: mempelai pria berjas dan mempelai wanita bergaun, baru turun di parkiran.
export function Walker({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden="true" strokeLinejoin="round" strokeLinecap="round" stroke={LINE} strokeWidth="2">
      <ellipse cx="32" cy="57" rx="26" ry="3.5" fill="black" opacity=".18" stroke="none" />
      <g className="gd-step">
        <path d="M10 56v-9h12v9z" fill="var(--inv-night)" />
        <path d="M7 47c0-8 3-12 9-12s9 4 9 12z" fill="var(--inv-night)" />
        <path d="M13 35l3 6 3-6z" fill="white" />
        <circle cx="16" cy="25" r="9" fill="#F4C9A0" />
        <path d="M7 24c0-9 5-12 9-12s10 3 9 12c-3-3-6-4-9-4s-6 1-9 4z" fill="#3A2A22" />
      </g>
      <g className="gd-step gd-step--b">
        <path d="M36 56v-5h12v5z" fill="#F4C9A0" />
        <path d="M34 53c0-12 3-18 8-18s8 6 8 18z" fill="white" />
        <path d="M40 38h4v5h-4z" fill="var(--inv-accent)" />
        <circle cx="42" cy="25" r="9" fill="#F4C9A0" />
        <path d="M32 27c-2-12 5-17 10-17s12 5 10 17c0 6-2 9-3 11-1-6-3-10-7-10s-6 4-7 10c-1-2-3-5-3-11z" fill="#4A2F26" />
        <path d="M44 12l3-4 3 4z" fill="var(--inv-accent)" />
      </g>
    </svg>
  );
}
