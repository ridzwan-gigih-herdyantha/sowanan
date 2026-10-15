import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { OfferCard } from "@/components/home/offer-card";
import { SiteHeader } from "@/components/home/site-header";
import { ThemeCatalog } from "@/components/home/theme-catalog";
import { ThemeFilter } from "@/components/home/theme-filter";
import { ThemeCard } from "@/components/home/themes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { Container, SectionSub, sectionPad } from "@/components/ui";
import { fill, generalWaLink, getSettings, textVars, THEME_CATEGORIES } from "@/lib/settings";
import { OG_BASE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pilihan Tema Undangan",
  description: "Semua tema undangan pernikahan digital Sowanan: minimalis, elegan, floral, islami, adat, game, dan lainnya. Buka demonya langsung.",
  alternates: { canonical: "/tema" },
  openGraph: { ...OG_BASE, title: "Pilihan Tema Undangan | Sowanan", url: "/tema", images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
};

// Katalog lengkap semua tema yang aktif. Kategori dibaca dari alamat halaman, jadi beranda bisa menautkan
// langsung ke satu kategori.
export default async function ThemesPage() {
  const s = await getSettings();
  const vars = textVars(s);
  const wa = generalWaLink(s);
  const sec = s.sections.tema;
  const props = {
    categories: Object.entries(THEME_CATEGORIES),
    waHref: vars.wa_link,
    items: s.themes.filter((t) => t.on).map((t, i) => ({ id: t.id, category: t.category, node: <ThemeCard theme={t} index={i} waHref={wa} animate={false} /> })),
  };

  return (
    <>
      <SiteHeader settings={s} waHref={wa} />
      <main className="bg-blush">
        <Container className={sectionPad}>
          <h1 className="font-serif text-[clamp(38px,6vw,60px)] leading-[1.05] text-ink">{sec.title}</h1>
          {sec.sub && <SectionSub className="mt-4 mb-8!">{fill(sec.sub, vars)}</SectionSub>}
          <Suspense fallback={<ThemeFilter {...props} />}>
            <ThemeCatalog {...props} />
          </Suspense>
          <OfferCard card={sec.custom} vars={vars} className="mt-14" />
        </Container>
      </main>
      <SiteFooter settings={s} vars={vars} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
      <RevealOnScroll />
    </>
  );
}
