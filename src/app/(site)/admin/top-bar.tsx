import Link from "next/link";
import { Pending } from "@/app/(site)/admin/pending";
import { LogoMark } from "@/components/logo";
import { logout } from "./actions";

const LINKS = [
  { href: "/admin/undangan", label: "Undangan" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin", label: "Pengaturan" },
];

export function AdminTopBar({ email, current }: { email: string; current: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E0D6] bg-white">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-[34px] px-4 sm:h-[62px] sm:flex-nowrap sm:px-7">
        <Link href="/admin/undangan" prefetch={false} className="flex h-[54px] items-center gap-2.5 text-[#2A2320] no-underline sm:h-auto has-[[data-pending]]:opacity-55">
          <LogoMark className="h-[22px] w-auto text-wine" />
          <b className="text-[13px] font-medium tracking-[.22em] uppercase">Sowanan</b>
          <Pending />
        </Link>
        <nav aria-label="Admin" className="order-last -mx-4 flex w-[calc(100%+2rem)] gap-[26px] overflow-x-auto border-t border-[#F0EAE2] px-4 [scrollbar-width:none] sm:order-none sm:mx-0 sm:ml-2 sm:w-auto sm:border-t-0 sm:px-0">
          {LINKS.map((l) => {
            const on = l.href === current;
            return (
              <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                aria-current={on ? "page" : undefined}
                className={`flex-none border-b-2 py-3.5 text-[13.5px] no-underline transition-colors duration-150 sm:py-[19px] ${on ? "border-wine text-wine" : "border-transparent text-ink-mute hover:text-[#2A2320]"} has-[[data-pending]]:opacity-55`}
              >
                {l.label}
                <Pending />
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-[18px] text-[13px] text-ink-mute">
          <span className="hidden max-w-[220px] truncate md:inline">{email}</span>
          <form action={logout}>
            <button type="submit" className="text-wine hover:underline hover:underline-offset-4">
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
