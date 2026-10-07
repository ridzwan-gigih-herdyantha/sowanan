import type { Metadata } from "next";
import { ClosingCta, SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Pricing } from "@/components/home/pricing";
import { SiteHeader } from "@/components/home/site-header";
import { Steps } from "@/components/home/steps";
import { Themes } from "@/components/home/themes";
import { plain } from "@/components/rich-text";
import { fill, formatRupiah, generalWaLink, getSettings, highestPrice, lowestPrice, slaRange, textVars, type Settings } from "@/lib/settings";
import { OG_BASE, SITE_URL } from "@/lib/site";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const price = formatRupiah(lowestPrice(s));
  return {
    title: { absolute: `Sowanan | Undangan Pernikahan Digital Mulai ${price}` },
    description: `Undangan pernikahan digital mulai ${price}, jadi dalam ${slaRange(s)}. Sudah termasuk RSVP, peta lokasi, buku ucapan, dan amplop digital.`,
    alternates: { canonical: "/" },
    openGraph: {
      ...OG_BASE,
      title: "Sowanan | Undangan Pernikahan Digital",
      description: `Kabarnya sampai dulu, sebelum tamunya datang. Undangan pernikahan digital mulai ${price}.`,
      url: "/",
      images: [{ url: "/img/og.jpg", width: 1200, height: 630, alt: "Sowanan, undangan pernikahan digital" }],
    },
  };
}

function jsonLd(s: Settings) {
  const vars = textVars(s);
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "Sowanan",
      description: "Jasa undangan pernikahan digital. Pesan lewat WhatsApp, undangan jadi dalam hitungan hari.",
      url: SITE_URL,
      image: `${SITE_URL}/img/og.jpg`,
      telephone: `+${s.contact.wa}`,
      ...(s.contact.email && { email: s.contact.email }),
      areaServed: "ID",
      address: { "@type": "PostalAddress", ...(s.contact.city && { addressLocality: s.contact.city }), addressCountry: "ID" },
      sameAs: [`https://instagram.com/${s.contact.instagram}`],
      priceRange: `${formatRupiah(lowestPrice(s))} - ${formatRupiah(highestPrice(s))}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq
        .filter((f) => f.on)
        .map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: plain(fill(f.a, vars)) },
        })),
    },
  ];
}

export default async function Home() {
  const s = await getSettings();
  const vars = textVars(s);
  const wa = generalWaLink(s);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(s)).replace(/</g, "\\u003c") }}
      />
      <SiteHeader settings={s} waHref={wa} />
      <main>
        <Hero settings={s} vars={vars} waHref={wa} />
        <Themes settings={s} vars={vars} waHref={wa} />
        <Features settings={s} vars={vars} />
        <Pricing settings={s} vars={vars} />
        <Steps settings={s} vars={vars} />
        <Faq settings={s} vars={vars} />
        <ClosingCta settings={s} vars={vars} waHref={wa} />
      </main>
      <SiteFooter settings={s} vars={vars} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
      <RevealOnScroll />
    </>
  );
}
