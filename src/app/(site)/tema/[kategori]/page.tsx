import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { Faq } from "@/components/home/faq";
import { OfferCard } from "@/components/home/offer-card";
import { SiteHeader } from "@/components/home/site-header";
import { ThemeCard } from "@/components/home/themes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { plain } from "@/components/rich-text";
import { Container, SectionSub, sectionPad } from "@/components/ui";
import { CATEGORY_COPY } from "@/lib/landing";
import { breadcrumbLd, categorySeo, faqLd } from "@/lib/seo";
import { fill, formatRupiah, generalWaLink, getSettings, lowestPrice, textVars, THEME_CATEGORIES, type Settings, type ThemeCategory } from "@/lib/settings";
import { OG_BASE, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ kategori: string }> };

const isCategory = (k: string): k is ThemeCategory => k in THEME_CATEGORIES;
// "Undangan Pernikahan Digital Tema Game" menjadi "Game".
const termOf = (k: ThemeCategory) => CATEGORY_COPY[k].heading.replace(/^.*Tema /, "");
const themesIn = (s: Settings, k: string) => s.themes.filter((t) => t.on && t.category === k);

export function generateStaticParams() {
  return Object.keys(THEME_CATEGORIES).map((kategori) => ({ kategori }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori } = await params;
  const s = await getSettings();
  const themes = themesIn(s, kategori);
  if (!isCategory(kategori) || !themes.length) return { robots: { index: false, follow: false } };
  const seo = categorySeo(CATEGORY_COPY[kategori].heading, termOf(kategori), formatRupiah(lowestPrice(s)), themes.map((t) => t.name));
  const url = `/tema/${kategori}`;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: url },
    openGraph: { ...OG_BASE, title: seo.title, description: seo.description, url, images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
  };
}

// Halaman per kategori tema untuk mesin pencari dan iklan. Isinya tema yang aktif di kategori itu, teks dari
// lib/landing.ts, dan tautan ke kategori lain. Kategori tanpa tema aktif berujung 404.
export default async function CategoryPage({ params }: Props) {
  const { kategori } = await params;
  const s = await getSettings();
  const themes = themesIn(s, kategori);
  if (!isCategory(kategori) || !themes.length) notFound();
  const copy = CATEGORY_COPY[kategori];
  const term = termOf(kategori);
  const vars = textVars(s);
  const wa = generalWaLink(s);
  const others = (Object.keys(THEME_CATEGORIES) as ThemeCategory[]).filter((k) => k !== kategori && themesIn(s, k).length);
  const faq = copy.faq.map((f, i) => ({ id: `${kategori}-${i}`, on: true, q: f.q, a: f.a }));
  const ld = [
    breadcrumbLd([
      ["Beranda", `${SITE_URL}/`],
      ["Tema", `${SITE_URL}/tema`],
      [term, `${SITE_URL}/tema/${kategori}`],
    ]),
    faqLd(faq.map((f) => ({ q: f.q, a: plain(fill(f.a, vars)) }))),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <SiteHeader settings={s} waHref={wa} />
      <main className="bg-blush">
        <Container className={sectionPad}>
          <nav aria-label="Jejak halaman" className="mb-5 text-[14px] text-ink-mute">
            <Link prefetch={false} href="/" className="underline-offset-4 hover:text-wine hover:underline">
              Beranda
            </Link>
            <span aria-hidden="true"> / </span>
            <Link prefetch={false} href="/tema" className="underline-offset-4 hover:text-wine hover:underline">
              Tema
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-ink-soft">{term}</span>
          </nav>
          <h1 className="font-serif text-[clamp(34px,5.5vw,56px)] leading-[1.08] text-ink">{copy.heading}</h1>
          <SectionSub className="mt-4 mb-6!">{fill(copy.intro, vars)}</SectionSub>
          <ul className="mb-6 grid gap-2 text-[16px] text-ink-body sm:grid-cols-3 sm:gap-4">
            {copy.fits.map((f) => (
              <li key={f} className="flex gap-2.5">
                <span aria-hidden="true" className="text-wine">
                  &#10003;
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mb-10 text-[15px] text-ink-soft">
            Semua tema di bawah bisa dipakai di semua paket, mulai {vars.harga}.{" "}
            <Link prefetch={false} href="/undangan-digital-murah" className="text-wine underline underline-offset-4">
              Lihat isi paket termurah
            </Link>
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:gap-x-8 lg:gap-y-12">
            {themes.map((t, i) => (
              <ThemeCard key={t.id} theme={t} index={i} waHref={wa} animate={false} />
            ))}
          </div>
          {others.length > 0 && (
            <nav aria-label="Kategori tema lain" className="mt-14">
              <h2 className="mb-4 text-[15px] font-medium text-ink">Kategori tema lain</h2>
              <ul className="flex flex-wrap gap-2">
                {others.map((k) => (
                  <li key={k}>
                    <Link
                      prefetch={false}
                      href={`/tema/${k}`}
                      className="inline-block rounded-full border border-line bg-white/60 px-4 py-1.5 text-[14px] text-ink-soft no-underline transition-colors duration-150 hover:border-wine hover:text-wine"
                    >
                      Tema {termOf(k)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <OfferCard card={s.sections.tema.custom} vars={vars} className="mt-14" />
        </Container>
        <div className="border-t border-line bg-ivory">
          <Faq settings={s} vars={vars} items={faq} id="tanya-kategori" title={`Seputar tema ${term.toLowerCase()}`} sub="" />
        </div>
      </main>
      <SiteFooter settings={s} vars={vars} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
      <RevealOnScroll />
    </>
  );
}
