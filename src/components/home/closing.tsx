import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/logo";
import { Container, Sprig, btn, cx, reveal } from "@/components/ui";
import { fill, THEME_CATEGORIES, themeScreen, type Settings } from "@/lib/settings";
import { mediaUrl } from "@/lib/storage/media";
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

// Poin singkat berbentuk pil di atas latar wine. Di HP selalu satu baris dan bisa digeser ke samping kalau layar
// terlalu sempit. Di sm ke atas boleh membungkus.
export function PointPills({ points, className }: { points: string[]; className?: string }) {
  if (!points.length) return null;
  return (
    <ul className={cx("flex gap-1.5 overflow-x-auto text-[11px] text-paper [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-visible sm:text-[13px] [&::-webkit-scrollbar]:hidden", className)}>
      {points.map((p) => (
        <li key={p} className="shrink-0 rounded-full border border-wine-soft/80 px-2.5 py-1 whitespace-nowrap sm:px-3.5">
          {p}
        </li>
      ))}
    </ul>
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
            <Image src={mediaUrl(themeScreen(t))} alt="" fill sizes="184px" className="object-cover object-top" />
          </span>
        </span>
      ))}
    </a>
  );
}

export function ClosingCta({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const c = settings.closing;
  const points = c.points.map((p) => fill(p, vars).trim()).filter(Boolean);
  // Sampul sesuai pilihan di Pengaturan. Tema yang dimatikan atau tanpa gambar dilewati, dan kalau tidak ada yang
  // tersisa dipakai tiga tema aktif pertama.
  const usable = settings.themes.filter((t) => t.on && t.image);
  const picked = c.covers.flatMap((slug) => usable.filter((t) => t.slug === slug).slice(0, 1));
  const covers = picked.length ? picked : usable.slice(0, 3);
  return (
    <section className="overflow-hidden bg-wine text-paper">
      <Container className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-[minmax(0,1fr)_330px] md:gap-12 md:py-[88px] lg:grid-cols-[minmax(0,1fr)_420px]">
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
          <PointPills points={points} className="mt-7 flex-wrap" />
        </div>
        {covers.length > 0 && <CoverFan covers={covers} label={c.button2 || settings.sections.tema.title} />}
      </Container>
    </section>
  );
}

const footLink = cx("rounded-sm text-dusk-light no-underline transition-colors duration-200 hover:text-paper", focus);
const footLabel = "mb-5 text-[17px] font-medium text-wine-pale";

// Ikon garis untuk kolom kontak dan deretan akun sosial di footer.
const ICON = {
  instagram: "M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 5a4 4 0 100 8 4 4 0 000-8zm5.5-1.5v.01",
  tiktok: "M14 3v11.5a3.5 3.5 0 11-3.5-3.5M14 3c.4 2.8 2.2 4.6 5 5",
  youtube:
    "M3.5 8.2c.2-1.6 1.3-2.6 2.9-2.7C8 5.4 10 5.3 12 5.3s4 .1 5.6.2c1.6.1 2.7 1.1 2.9 2.7.2 1.2.2 2.5.2 3.8s0 2.6-.2 3.8c-.2 1.6-1.3 2.6-2.9 2.7-1.6.1-3.6.2-5.6.2s-4-.1-5.6-.2c-1.6-.1-2.7-1.1-2.9-2.7-.2-1.2-.2-2.5-.2-3.8s0-2.6.2-3.8zM10 9.2v5.6l4.8-2.8z",
  pinterest:
    "M12 3a9 9 0 110 18 9 9 0 010-18zM10.2 20.8l1.6-7m-.4 1.9c.5.6 1.2.9 2 .9 2.3 0 3.6-2.1 3.6-4.4 0-2.5-2-4.2-4.6-4.2-2.9 0-4.8 2-4.8 4.4 0 1 .4 1.9 1 2.3",
  clock: "M12 3a9 9 0 110 18 9 9 0 010-18zm0 4.5V12l3 2",
  mail: "M4 6h16v12H4zm0 0l8 6.5L20 6",
} as const;

function LineIcon({ kind, className }: { kind: keyof typeof ICON; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={ICON[kind]} />
    </svg>
  );
}

// Satu baris kontak: ikon di kiri, isi utama terang, dan keterangan redup di bawahnya.
function ContactRow({ icon, title, note, href }: { icon: ReactNode; title: string; note?: string; href?: string }) {
  const row = "grid grid-cols-[28px_minmax(0,1fr)] gap-x-4";
  const body = (
    <>
      <span className="mt-0.5 text-wine-pale">{icon}</span>
      <span>
        <span className={cx("block text-[16px] text-paper", href && "transition-colors duration-200 group-hover:text-wine-pale")}>{title}</span>
        {note && <span className="mt-1 block text-[14px] leading-snug text-dusk">{note}</span>}
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} rel={href.startsWith("http") ? "noopener" : undefined} className={cx(row, "group rounded-sm no-underline", focus)}>
          {body}
        </a>
      ) : (
        <div className={row}>{body}</div>
      )}
    </li>
  );
}

// Peta kecil di ujung halaman: merek, isi halaman, pilihan tema, dan cara menghubungi.
export function SiteFooter({ settings, vars, waHref }: { settings: Settings; vars: Record<string, string>; waHref: string }) {
  const f = settings.footer;
  const s = settings.sections;
  const c = settings.contact;
  const nav: [string, string][] = [
    ["/tema", s.tema.title],
    ["/#fitur", s.fitur.title],
    ["/#harga", s.harga.title],
    ["/#cara", s.cara.title],
    ["/#tanya", s.faq.title],
  ];
  // Kategori yang punya paling sedikit satu tema aktif, masing-masing menaut ke halaman tema dengan filternya.
  const active = new Set<string>(settings.themes.filter((t) => t.on).map((t) => t.category));
  const categories = Object.entries(THEME_CATEGORIES).filter(([k]) => active.has(k));
  // Instagram selalu ada, akun lain hanya kalau diisi di Pengaturan.
  const socials: [keyof typeof ICON, string, string][] = [
    ["instagram", "Instagram", `https://instagram.com/${c.instagram}`],
    ["tiktok", "TikTok", c.tiktok && `https://tiktok.com/@${c.tiktok}`],
    ["youtube", "YouTube", c.youtube && `https://youtube.com/@${c.youtube}`],
    ["pinterest", "Pinterest", c.pinterest && `https://pinterest.com/${c.pinterest}`],
  ];
  return (
    <footer className="relative isolate overflow-hidden bg-night text-[15px] text-dusk-light">
      <Sprig className="-bottom-10 -left-10 -z-10 hidden h-80 rotate-[8deg] text-wine-pale/15 md:block lg:-left-4 lg:h-[420px]" />
      <Sprig className="-top-6 -right-10 -z-10 h-56 -scale-x-100 rotate-[196deg] text-wine-pale/12 md:h-80 lg:-right-4 lg:h-[420px] lg:text-wine-pale/15" />

      <Container className="grid grid-cols-2 gap-x-6 gap-y-11 pt-14 pb-12 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] md:gap-10 md:pt-[72px] md:pb-16">
        <div className="col-span-2 md:col-span-1">
          <p className="flex items-center gap-4">
            <LogoMark className="h-14 w-auto text-wine-pale" />
            <span>
              <span className="block font-serif text-[34px] leading-none text-paper">{SITE_NAME}</span>
              <span className="mt-2 block text-[11px] tracking-[3px] text-dusk uppercase">Undangan pernikahan digital</span>
            </span>
          </p>
          {f.line1 && <p className="mt-6 max-w-[44ch] text-[16px] leading-relaxed text-dusk-light">{fill(f.line1, vars)}</p>}
          {f.line2 && <p className="mt-2 max-w-[44ch] text-[14px] text-dusk">{fill(f.line2, vars)}</p>}
          <ul className="mt-7 flex gap-3">
            {socials
              .filter(([, , href]) => href)
              .map(([icon, label, href]) => (
                <li key={icon}>
                  <a
                    href={href}
                    rel="noopener"
                    aria-label={label}
                    className={cx(
                      "flex size-11 items-center justify-center rounded-full border border-night-line text-dusk-light transition-colors duration-200 hover:border-wine-pale hover:text-paper",
                      focus,
                    )}
                  >
                    <LineIcon kind={icon} className="size-5" />
                  </a>
                </li>
              ))}
          </ul>
        </div>

        <nav aria-label={f.nav}>
          <p className={footLabel}>{f.nav}</p>
          <ul className="grid gap-3.5">
            {nav.map(([href, label]) => (
              <li key={href}>
                <a href={href} className={footLink}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {categories.length > 0 && (
          <nav aria-label={f.demos}>
            <p className={footLabel}>{f.demos}</p>
            <ul className="grid gap-3.5">
              {categories.map(([k, name]) => (
                <li key={k}>
                  <a href={`/tema?kategori=${k}`} className={footLink}>
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="col-span-2 md:col-span-1">
          <p className={footLabel}>{f.reach}</p>
          <ul className="grid gap-6">
            <ContactRow href={waHref} icon={<WaIcon className="size-6" />} title={vars.wa} note="Chat kami di WhatsApp" />
            <ContactRow
              href={`https://instagram.com/${c.instagram}`}
              icon={<LineIcon kind="instagram" className="size-6" />}
              title={`@${c.instagram}`}
              note="Ikuti untuk inspirasi tema"
            />
            {c.email && <ContactRow href={`mailto:${c.email}`} icon={<LineIcon kind="mail" className="size-6" />} title={c.email} />}
            {vars.jam && <ContactRow icon={<LineIcon kind="clock" className="size-6" />} title={vars.jam} note={vars.hari || undefined} />}
          </ul>
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-2 border-t border-night-line py-6 text-[13px] text-dusk sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. Hak cipta dilindungi.
          </p>
          <Link prefetch={false} href="/ketentuan" className={cx(footLink, "w-fit text-dusk")}>
            Syarat &amp; Ketentuan
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
