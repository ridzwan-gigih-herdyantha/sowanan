import Link from "next/link";
import type { ReactNode } from "react";
import { Pending } from "@/app/(site)/admin/pending";

const TABS = [
  { key: "edit", label: "Editor", href: "" },
  { key: "tamu", label: "Tamu", href: "/tamu" },
  { key: "respon", label: "RSVP & ucapan", href: "/respon" },
  { key: "palet", label: "Palet", href: "/palet" },
  { key: "akses", label: "Akses mempelai", href: "/akses" },
];

// Lebar isi halaman undangan selain editor, supaya semua tab tampil dengan susunan yang sama.
export const PAGE = "mx-auto max-w-[1040px] py-8 sm:py-10";

export function InvitationTabs({ slug, current }: { slug: string; current: string }) {
  return (
    <nav aria-label="Menu undangan" className="-mx-1 flex gap-1 overflow-x-auto px-1 text-[14px] [scrollbar-width:none]">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={`/admin/undangan/${slug}${t.href}`}
          prefetch={false}
          aria-current={t.key === current ? "page" : undefined}
          className={`shrink-0 rounded-sm px-3 py-1.5 whitespace-nowrap no-underline ${t.key === current ? "bg-wine text-white" : "text-ink-soft hover:bg-blush"} has-[[data-pending]]:opacity-55`}
        >
          {t.label}
          <Pending />
        </Link>
      ))}
    </nav>
  );
}

// Kepala semua halaman satu undangan: kembali ke daftar, nama, status, menu tab, dan aksi di kanan.
export function InvitationHeader({ slug, label, current, published, paid, actions }: { slug: string; label: string; current: string; published: boolean; paid: boolean; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 -mx-5 border-b border-line bg-ivory/95 px-5 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 xl:h-14 xl:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 xl:flex-none">
          <Link
            href="/admin/undangan"
            prefetch={false}
            aria-label="Semua undangan"
            title="Semua undangan"
            className="flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-soft no-underline hover:bg-blush hover:text-wine has-[[data-pending]]:opacity-55"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <Pending />
          </Link>
          <h1 className="min-w-0 truncate font-serif text-xl leading-tight">{label}</h1>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${published ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>{published ? "Live" : "Draft"}</span>
          {!paid && (
            <span title="Watermark SOWANAN.COM tampil di undangan. Ubah status di daftar undangan." className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-900 ring-1 ring-amber-300">
              Belum lunas
            </span>
          )}
        </div>
        <div className="order-last w-full xl:order-none xl:w-auto xl:flex-1">
          <InvitationTabs slug={slug} current={current} />
        </div>
        {actions && <div className="flex items-center gap-x-4">{actions}</div>}
      </div>
    </header>
  );
}

// Judul dan penjelasan singkat di awal isi halaman.
export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-[30px] leading-tight">{title}</h2>
      {children && <p className="mt-1.5 max-w-[65ch] text-[15px] text-ink-soft">{children}</p>}
    </div>
  );
}
