import Link from "next/link";
import { Container, btn, cx } from "@/components/ui";

const links = [
  { href: "#tema", label: "Pilihan Tema" },
  { href: "#fitur", label: "Fitur" },
  { href: "#paket", label: "Harga" },
  { href: "#tanya", label: "Tanya Jawab" },
];

export function SiteHeader({ waHref }: { waHref: string }) {
  return (
    <header className="border-b border-line">
      <Container className="flex items-center justify-between gap-4 py-[22px]">
        <Link href="/" className="font-serif text-[26px] leading-tight tracking-[.5px] text-ink no-underline">
          Sowanan
          <span className="-mt-1 block font-sans text-[10px] tracking-[1.5px] text-ink-mute sm:text-[11px] sm:tracking-[2px]">
            UNDANGAN PERNIKAHAN DIGITAL
          </span>
        </Link>
        <nav aria-label="Utama" className="flex items-center gap-[34px] text-[15px]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden text-ink no-underline transition-colors duration-200 hover:text-wine lg:inline"
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
