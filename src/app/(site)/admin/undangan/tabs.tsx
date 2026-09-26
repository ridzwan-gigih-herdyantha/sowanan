import Link from "next/link";

const TABS = [
  { key: "edit", label: "Isi undangan", href: "" },
  { key: "tamu", label: "Tamu", href: "/tamu" },
  { key: "respon", label: "RSVP & ucapan", href: "/respon" },
];

export function InvitationTabs({ slug, current }: { slug: string; current: string }) {
  return (
    <nav aria-label="Menu undangan" className="-mx-1 flex gap-1 overflow-x-auto px-1 text-[14px] [scrollbar-width:none]">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={`/admin/undangan/${slug}${t.href}`}
          prefetch={false}
          aria-current={t.key === current ? "page" : undefined}
          className={`shrink-0 rounded-sm px-3 py-1.5 whitespace-nowrap no-underline ${t.key === current ? "bg-wine text-white" : "text-ink-soft hover:bg-blush"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
