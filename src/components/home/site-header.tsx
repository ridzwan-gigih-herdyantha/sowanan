import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { Container, btn, cx } from "@/components/ui";
import type { Settings } from "@/lib/settings";

export function SiteHeader({ settings, waHref }: { settings: Settings; waHref: string }) {
  const sec = settings.sections;
  const links = [
    { href: "#tema", label: sec.tema.title },
    { href: "#fitur", label: sec.fitur.title },
    { href: "#harga", label: sec.harga.title },
    { href: "#tanya", label: sec.faq.title },
  ];
  return (
    <header className="border-b border-line">
      <Container className="flex items-center justify-between gap-4 py-[22px]">
        <Link prefetch={false} href="/" className="flex min-w-0 items-center gap-2.5 text-ink no-underline sm:gap-3">
          <LogoMark className="h-9 w-auto text-wine sm:h-11" />
          <span className="font-serif text-[26px] leading-tight tracking-[.5px]">
            Sowanan
            <span className="-mt-1 block font-sans text-[9px] max-[379px]:hidden tracking-[1px] whitespace-nowrap text-ink-mute min-[400px]:text-[10px] min-[400px]:tracking-[1.5px] sm:text-[11px] sm:tracking-[2px]">
              UNDANGAN PERNIKAHAN DIGITAL
            </span>
          </span>
        </Link>
        <nav aria-label="Utama" className="flex items-center gap-7 text-[15px] min-[1260px]:gap-[34px]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden whitespace-nowrap text-ink no-underline transition-colors duration-200 hover:text-wine min-[1180px]:inline"
            >
              {l.label}
            </a>
          ))}
          <a href={waHref} className={cx(btn.dark, "shrink-0 whitespace-nowrap max-sm:px-4 max-sm:py-2.5")}>
            Pesan Sekarang
          </a>
        </nav>
      </Container>
    </header>
  );
}
