import Link from "next/link";

const TABS = [
  { key: "edit", label: "Isi undangan", href: "" },
  { key: "tamu", label: "Tamu", href: "/tamu" },
];

export function InvitationTabs({ slug, current }: { slug: string; current: string }) {
  return (
    <nav aria-label="Menu undangan" className="flex gap-1 text-[14px]">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={`/admin/undangan/${slug}${t.href}`}
          prefetch={false}
          aria-current={t.key === current ? "page" : undefined}
          className={`rounded-sm px-3 py-1.5 no-underline ${t.key === current ? "bg-wine text-white" : "text-ink-soft hover:bg-blush"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
