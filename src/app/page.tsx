import type { Metadata } from "next";
import { ClosingCta, SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { Faq, faqItems } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Pricing } from "@/components/home/pricing";
import { SiteHeader } from "@/components/home/site-header";
import { Steps } from "@/components/home/steps";
import { Themes } from "@/components/home/themes";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { formatRupiah, getSettings, waLink, type Settings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const price = formatRupiah(s.priceHemat);
  return {
    title: { absolute: `Sowanan | Undangan Pernikahan Digital Mulai ${price}` },
    description: `Sowanan, jasa undangan pernikahan digital. Kirim data lewat WhatsApp, undangan jadi dalam ${s.sla}. Sudah termasuk RSVP, peta lokasi, buku ucapan, dan amplop digital.`,
    alternates: { canonical: "/" },
    openGraph: {
      title: "Sowanan | Undangan Pernikahan Digital",
      description: `Kabarnya sampai dulu, sebelum tamunya datang. Undangan pernikahan digital mulai ${price}.`,
      url: "/",
      images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
    },
  };
}

function jsonLd(s: Settings) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "Sowanan",
      description: "Jasa undangan pernikahan digital.",
      url: SITE_URL,
      image: `${SITE_URL}/img/og.jpg`,
      telephone: `+${s.waNumber}`,
      areaServed: "ID",
      address: { "@type": "PostalAddress", addressLocality: "Semarang", addressCountry: "ID" },
      sameAs: [`https://instagram.com/${s.instagram}`],
      priceRange: `${formatRupiah(s.priceHemat)} - ${formatRupiah(s.priceDesain)}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems(s).map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.text },
      })),
    },
  ];
}

export default async function Home() {
  const s = await getSettings();
  const wa = waLink(s.waNumber);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(s)).replace(/</g, "\\u003c") }}
      />
      <SiteHeader waHref={wa} />
      <main>
        <Hero price={formatRupiah(s.priceHemat)} sla={s.sla} hours={s.operatingHours} waHref={wa} />
        <Themes waHref={wa} />
        <Features />
        <Pricing settings={s} waHref={wa} />
        <Steps sla={s.sla} />
        <Faq settings={s} />
        <ClosingCta hours={s.operatingHours} waHref={wa} />
      </main>
      <SiteFooter waHref={wa} instagram={s.instagram} />
      <WhatsAppFloat waHref={wa} />
      <RevealOnScroll />
    </>
  );
}
