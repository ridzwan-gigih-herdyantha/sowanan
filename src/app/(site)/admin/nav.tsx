import Link from "next/link";
import { logout } from "./actions";

const LINKS = [
  { href: "/admin/undangan", label: "Undangan" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin", label: "Pengaturan" },
];

export function AdminNav({ email, current }: { email: string; current: string }) {
  return (
    <nav aria-label="Admin" className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line pb-4 text-[14px]">
      <div className="flex gap-5">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            prefetch={false}
            aria-current={l.href === current ? "page" : undefined}
            className={`no-underline ${l.href === current ? "font-medium text-wine" : "text-ink-soft hover:text-wine"}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4 text-ink-mute">
        <span className="hidden sm:inline">{email}</span>
        <form action={logout}>
          <button type="submit" className="text-wine underline underline-offset-4">
            Keluar
          </button>
        </form>
      </div>
    </nav>
  );
}
