import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { Container, btn, cx, reveal } from "@/components/ui";
import { fill, type Settings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

const WA_PATH =
  "M12 2a10 10 0 00-8.7 14.9L2 22l5.3-1.4A10 10 0 1012 2zm5.8 14.2c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.3.4-.3.4c-.1.1-.2.3 0 .5.1.2.6 1 1.3 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.5.3 0 .1 0 .6-.2 1.2z";

export function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={WA_PATH} />
    </svg>
  );
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper";

// Posisi sampul dalam kipas: kiri, tengah lebih besar di depan, kanan. Saat kursor di atas atau fokus keyboard,
// kipas sedikit membuka untuk menunjukkan bahwa tumpukan ini bisa diklik.
const SIDE = "w-[112px] md:w-[146px]";
const FAN = [
  `${SIDE} z-0 -translate-x-[82%] translate-y-[5%] -rotate-[9deg] motion-safe:group-hover:-translate-x-[96%] motion-safe:group-hover:-rotate-[12deg] motion-safe:group-focus-visible:-translate-x-[96%] motion-safe:group-focus-visible:-rotate-[12deg]`,
  "w-[140px] md:w-[184px] z-20 motion-safe:group-hover:-translate-y-[4%] motion-safe:group-focus-visible:-translate-y-[4%]",
  `${SIDE} z-10 translate-x-[82%] translate-y-[5%] rotate-[9deg] motion-safe:group-hover:translate-x-[96%] motion-safe:group-hover:rotate-[12deg] motion-safe:group-focus-visible:translate-x-[96%] motion-safe:group-focus-visible:rotate-[12deg]`,
];

// Sampul tema seperti layar HP, sama dengan bagian pilihan tema. Satu tautan menuju bagian itu,
// karena di sana calon klien bisa membandingkan semua tema sebelum membuka demonya.
function CoverFan({ covers, label }: { covers: Settings["themes"]; label: string }) {
  return (
    <a href="#tema" aria-label={label} className={cx("group relative flex h-[320px] items-center justify-center rounded-sm md:h-[430px]", focus)} {...reveal(1)}>
      {covers.map((t, i) => (
        <span
          key={t.id}
          className={cx(
            "absolute block aspect-[390/844] rounded-[18px] bg-ink p-1 shadow-[0_18px_36px_rgba(31,26,23,.38)] transition-[translate,rotate] duration-200 ease-out",
            FAN[covers.length === 1 ? 1 : i],
          )}
        >
          <span className="relative block size-full overflow-hidden rounded-[14px]">
            <Image src={t.image} alt="" fill sizes="184px" className="object-cover object-top" />
          </span>
        </span>
      ))}
    </a>
  );
}

export function ClosingCta({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const c = settings.closing;
  const points = c.points.map((p) => fill(p, vars).trim()).filter(Boolean);
  const covers = settings.themes.filter((t) => t.on && t.image).slice(0, 3);
  return (
    <section className="overflow-hidden bg-wine text-paper">
      <Container className="grid items-center gap-10 py-16 md:grid-cols-[minmax(0,1fr)_330px] md:gap-12 md:py-[88px] lg:grid-cols-[minmax(0,1fr)_420px]">
        <div {...reveal()}>
          <h2 className="font-serif text-[clamp(36px,5vw,56px)] leading-[1.08] font-medium text-paper">{c.title}</h2>
          {c.text && <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-[#f2dfe2]">{fill(c.text, vars)}</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={waHref}
              className={cx(btn.base, "inline-flex items-center justify-center gap-2.5 bg-paper px-7 py-4 text-base text-wine-dark hover:-translate-y-0.5 hover:bg-white", focus)}
            >
              <WaIcon className="size-5 shrink-0" />
              {c.button}
            </a>
            {c.button2 && (
              <a
                href="#tema"
                className={cx(
                  "inline-flex items-center justify-center rounded-sm border border-paper/45 px-7 py-[15px] text-base text-paper no-underline transition-colors duration-200 hover:border-paper hover:bg-paper/10",
                  focus,
                )}
              >
                {c.button2}
              </a>
            )}
          </div>
          {points.length > 0 && (
            <ul className="mt-9 flex flex-col gap-2 border-t border-paper/20 pt-6 text-[15px] text-[#f2dfe2] sm:flex-row sm:flex-wrap sm:gap-x-8">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
        {covers.length > 0 && <CoverFan covers={covers} label={c.button2 || settings.sections.tema.title} />}
      </Container>
    </section>
  );
}

const footLink = cx("rounded-sm text-dusk-light no-underline transition-colors duration-200 hover:text-paper", focus);
const footLabel = "mb-4 text-[13px] font-medium text-dusk";

// Peta kecil di ujung halaman: merek, isi halaman, contoh undangan, dan cara menghubungi.
export function SiteFooter({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const f = settings.footer;
  const s = settings.sections;
  const nav: [string, string][] = [
    ["tema", s.tema.title],
    ["fitur", s.fitur.title],
    ["harga", s.harga.title],
    ["cara", s.cara.title],
    ["tanya", s.faq.title],
  ];
  const demos = settings.themes.filter((t) => t.on);
  const hours = [vars.hari, vars.jam].filter(Boolean).join(", ");
  return (
    <footer className="bg-night text-[15px] text-dusk-light">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 pt-14 pb-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-8 md:pt-[72px]">
        <div className="col-span-2 md:col-span-1">
          <p className="flex items-center gap-2.5 font-serif text-2xl text-paper">
            <LogoMark className="h-7 w-auto text-wine-pale" />
            {SITE_NAME}
          </p>
          {f.line1 && <p className="mt-3 text-[14px] text-dusk">{fill(f.line1, vars)}</p>}
          {f.line2 && <p className="mt-1 text-[14px] text-dusk">{fill(f.line2, vars)}</p>}
        </div>

        <nav aria-label={f.nav}>
          <p className={footLabel}>{f.nav}</p>
          <ul className="grid gap-2.5">
            {nav.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className={footLink}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {demos.length > 0 && (
          <nav aria-label={f.demos}>
            <p className={footLabel}>{f.demos}</p>
            <ul className="grid gap-2.5">
              {demos.map((t) => (
                <li key={t.id}>
                  <a href={t.demo || `/${t.slug}`} className={footLink}>
                    {t.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="col-span-2 md:col-span-1">
          <p className={footLabel}>{f.reach}</p>
          <ul className="grid gap-2.5">
            <li>
              <a href={waHref} className={cx(footLink, "inline-flex items-center gap-2")}>
                <WaIcon className="size-4 shrink-0" />
                {vars.wa}
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${settings.contact.instagram}`} rel="noopener" className={footLink}>
                @{settings.contact.instagram}
              </a>
            </li>
            {settings.contact.email && (
              <li>
                <a href={`mailto:${settings.contact.email}`} className={footLink}>
                  {settings.contact.email}
                </a>
              </li>
            )}
            {hours && <li className="text-dusk">{hours}</li>}
          </ul>
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-2 border-t border-night-line py-6 text-[13px] text-dusk sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {SITE_NAME}</p>
          <Link prefetch={false} href="/ketentuan" className={cx(footLink, "w-fit text-dusk")}>
            Ketentuan
          </Link>
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
      <WaIcon className="size-[30px]" />
    </a>
  );
}
