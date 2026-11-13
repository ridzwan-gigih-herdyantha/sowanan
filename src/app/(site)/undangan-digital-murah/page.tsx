import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { Faq } from "@/components/home/faq";
import { Pricing } from "@/components/home/pricing";
import { SiteHeader } from "@/components/home/site-header";
import { ThemeCard } from "@/components/home/themes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { plain } from "@/components/rich-text";
import { btn, Container, SectionSub, SectionTitle, sectionPad } from "@/components/ui";
import { CHEAP_COPY } from "@/lib/landing";
import { breadcrumbLd, cheapSeo, faqLd } from "@/lib/seo";
import { fill, generalWaLink, getSettings, textVars, THEME_CATEGORIES } from "@/lib/settings";
import { OG_BASE, SITE_URL } from "@/lib/site";

const URL_PATH = "/undangan-digital-murah";

export async function generateMetadata(): Promise<Metadata> {
  const vars = textVars(await getSettings());
  const seo = cheapSeo(vars.harga, vars.waktu);
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: URL_PATH },
    openGraph: { ...OG_BASE, title: seo.title, description: seo.description, url: URL_PATH, images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
  };
}

// Halaman untuk pencarian dan iklan undangan murah. Harga, paket, dan tema selalu dibaca dari pengaturan,
// jadi klaimnya ikut berubah kalau harga diubah di admin.
export default async function CheapPage() {
  const s = await getSettings();
  const vars = textVars(s);
  const wa = generalWaLink(s);
  const themes = s.themes.filter((t) => t.on);
  const categories = (Object.keys(THEME_CATEGORIES) as (keyof typeof THEME_CATEGORIES)[]).filter((k) => themes.some((t) => t.category === k));
  const faq = CHEAP_COPY.faq.map((f, i) => ({ id: `murah-${i}`, on: true, q: f.q, a: f.a }));
  const ld = [
    breadcrumbLd([
      ["Beranda", `${SITE_URL}/`],
      ["Undangan digital murah", `${SITE_URL}${URL_PATH}`],
    ]),
    faqLd(faq.map((f) => ({ q: f.q, a: plain(fill(f.a, vars)) }))),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <SiteHeader settings={s} waHref={wa} />
      <main>
        <section className="bg-ivory">
          <Container className={sectionPad}>
            <h1 className="max-w-[20ch] font-serif text-[clamp(34px,5.5vw,56px)] leading-[1.08] text-ink">{fill(CHEAP_COPY.heading, vars)}</h1>
            <SectionSub className="mt-4 mb-6!">{fill(CHEAP_COPY.intro, vars)}</SectionSub>
            <ul className="mb-9 grid gap-2 text-[16px] text-ink-body sm:grid-cols-2 sm:gap-x-8">
              {CHEAP_COPY.points.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-wine">
                    &#10003;
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={wa} className={btn.primary}>
                Pesan lewat WhatsApp
              </a>
              <a href="#tema-murah" className={btn.ghost}>
                Lihat semua tema
              </a>
            </div>
          </Container>
        </section>
        <Pricing settings={s} vars={vars} />
        <section id="tema-murah" className="bg-blush">
          <Container className={sectionPad}>
            <SectionTitle>Semua tema, mulai {vars.harga}</SectionTitle>
            <SectionSub className="mb-6!">Pilih tema mana pun dari katalog. Harganya sama, tema tidak dibedakan per paket.</SectionSub>
            <ul className="mb-9 flex flex-wrap gap-2">
              {categories.map((k) => (
                <li key={k}>
                  <Link
                    prefetch={false}
                    href={`/tema/${k}`}
                    className="inline-block rounded-full border border-line bg-white/60 px-4 py-1.5 text-[14px] text-ink-soft no-underline transition-colors duration-150 hover:border-wine hover:text-wine"
                  >
                    {THEME_CATEGORIES[k]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:gap-x-8 lg:gap-y-12">
              {themes.map((t, i) => (
                <ThemeCard key={t.id} theme={t} index={i} waHref={wa} animate={false} />
              ))}
            </div>
          </Container>
        </section>
        <div className="border-t border-line bg-ivory">
          <Faq settings={s} vars={vars} items={faq} id="tanya-murah" title="Seputar harga" sub="" />
        </div>
      </main>
      <SiteFooter settings={s} vars={vars} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
      <RevealOnScroll />
    </>
  );
}
