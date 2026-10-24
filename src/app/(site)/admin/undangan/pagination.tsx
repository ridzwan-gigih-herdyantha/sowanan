import Link from "next/link";
import { Pending } from "@/app/(site)/admin/pending";

// Nomor halaman yang tampil: pertama, terakhir, dan dua di sekitar halaman aktif. Celah diisi elipsis.
function numbers(page: number, pages: number): (number | "...")[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ["..." as const, n] : [n]));
}

// Navigasi halaman daftar undangan. Pencarian dan filter yang aktif ikut di setiap tautan.
export function Pagination({ page, pages, total, perPage, params }: { page: number; pages: number; total: number; perPage: number; params: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (n: number) => {
    const q = new URLSearchParams(params);
    if (n > 1) q.set("hal", String(n));
    const s = q.toString();
    return s ? `/admin/undangan?${s}` : "/admin/undangan";
  };
  const from = (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const cell = "flex h-9 min-w-9 items-center justify-center rounded-sm px-2.5 text-[14px] no-underline";
  const arrow = (n: number, label: string, path: string) =>
    n >= 1 && n <= pages ? (
      <Link href={href(n)} prefetch={false} aria-label={label} className={`${cell} text-ink-soft hover:bg-blush hover:text-wine has-[[data-pending]]:opacity-55`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d={path} />
        </svg>
        <Pending />
      </Link>
    ) : (
      <span aria-hidden="true" className={`${cell} text-ink-mute/40`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={path} />
        </svg>
      </span>
    );

  return (
    <nav aria-label="Halaman daftar undangan" className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[13px] text-ink-mute">
        {from} sampai {to} dari {total} undangan
      </p>
      <div className="flex items-center gap-1">
        {arrow(page - 1, "Halaman sebelumnya", "M15 18l-6-6 6-6")}
        {numbers(page, pages).map((n, i) =>
          n === "..." ? (
            <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-ink-mute">
              ...
            </span>
          ) : n === page ? (
            <span key={n} aria-current="page" className={`${cell} bg-wine text-white`}>
              {n}
            </span>
          ) : (
            <Link key={n} href={href(n)} prefetch={false} className={`${cell} text-ink-soft hover:bg-blush hover:text-wine has-[[data-pending]]:opacity-55`}>
              {n}
              <Pending />
            </Link>
          ),
        )}
        {arrow(page + 1, "Halaman berikutnya", "M9 18l6-6-6-6")}
      </div>
    </nav>
  );
}
