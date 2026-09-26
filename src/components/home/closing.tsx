import Link from "next/link";
import { Container, SectionTitle, btn, cx, reveal } from "@/components/ui";

export function ClosingCta({ hours, waHref }: { hours: string; waHref: string }) {
  return (
    <section className="bg-wine">
      <Container className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:gap-12 md:py-[72px]">
        <div {...reveal()}>
          <SectionTitle className="text-white">Tanggal acaranya kapan?</SectionTitle>
          <p className="max-w-[56ch] text-[17px] text-[#f2dfe2]">
            Chat saja dulu, belum harus memesan. Kami balas dalam 1 jam di jam {hours}.
          </p>
        </div>
        <a
          href={waHref}
          className={cx(
            btn.base,
            "w-full shrink-0 bg-white px-[34px] py-[18px] text-center text-wine-dark hover:-translate-y-0.5 hover:bg-[#fff3f5] md:w-auto",
          )}
        >
          Chat WhatsApp
        </a>
      </Container>
    </section>
  );
}

export function SiteFooter({ waHref, instagram }: { waHref: string; instagram: string }) {
  const link = "mr-[22px] inline-block text-dusk no-underline transition-colors duration-200 hover:text-paper md:mr-0 md:ml-[26px]";
  return (
    <footer className="bg-ink text-sm text-dusk">
      <Container className="flex flex-col items-start gap-4 py-10 md:flex-row md:items-center md:justify-between md:gap-6">
        <div>
          <div className="font-serif text-xl text-paper">Sowanan</div>
          <div className="mt-1.5">Undangan pernikahan digital &middot; Semarang</div>
          <div className="mt-1.5">Dibuat oleh Nine Dragon Labs</div>
        </div>
        <div>
          <Link prefetch={false} href="/ketentuan" className={link}>
            Ketentuan
          </Link>
          <a href={waHref} className={link}>
            WhatsApp
          </a>
          <a href={`https://instagram.com/${instagram}`} className={link} rel="noopener">
            Instagram
          </a>
        </div>
      </Container>
    </footer>
  );
}

export function WhatsAppFloat({ waHref }: { waHref: string }) {
  return (
    <a
      href={waHref}
      aria-label="Tanya lewat WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-wa text-white no-underline shadow-[0_8px_24px_rgba(31,26,23,.26)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:scale-[1.04] hover:shadow-[0_12px_30px_rgba(31,26,23,.32)] active:translate-y-0 active:scale-[.98] motion-reduce:transform-none sm:right-6 sm:bottom-6 sm:size-[60px]"
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 00-8.7 14.9L2 22l5.3-1.4A10 10 0 1012 2zm5.8 14.2c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.3.4-.3.4c-.1.1-.2.3 0 .5.1.2.6 1 1.3 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.5.3 0 .1 0 .6-.2 1.2z" />
      </svg>
    </a>
  );
}
