import type { Metadata } from "next";
import { ArticleLead, ArticleRow } from "@/components/article/article-row";
import { SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { SiteHeader } from "@/components/home/site-header";
import { Container, sectionPad } from "@/components/ui";
import { getArticles } from "@/lib/article/load";
import { generalWaLink, getSettings, textVars } from "@/lib/settings";
import { OG_BASE } from "@/lib/site";

const description = "Catatan seputar persiapan pernikahan, daftar tamu, dan undangan digital dari Sowanan.";

export const metadata: Metadata = {
  title: "Artikel Persiapan Pernikahan dan Undangan Digital",
  description,
  alternates: { canonical: "/artikel" },
  openGraph: { ...OG_BASE, title: "Artikel Persiapan Pernikahan dan Undangan Digital | Sowanan", description, url: "/artikel", images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
};

export default async function ArticlesPage() {
  const [s, articles] = await Promise.all([getSettings(), getArticles()]);
  const wa = generalWaLink(s);
  const [lead, ...rest] = articles;

  return (
    <>
      <SiteHeader settings={s} waHref={wa} />
      <main className="bg-ivory">
        <Container className={sectionPad}>
          <h1 className="font-serif text-[clamp(38px,6vw,60px)] leading-[1.05] text-ink">Artikel</h1>
          <p className="mt-4 mb-8 max-w-[56ch] text-[17px] leading-relaxed text-ink-soft sm:mb-11">{description}</p>
          {lead ? <ArticleLead article={lead} /> : <p className="border-t border-line py-10 text-[16px] text-ink-mute">Belum ada artikel. Tulisan pertama sedang disiapkan.</p>}
          {rest.length > 0 && (
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {rest.map((a) => (
                <li key={a.slug}>
                  <ArticleRow article={a} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter settings={s} vars={textVars(s)} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
    </>
  );
}
