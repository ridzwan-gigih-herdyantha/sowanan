import type { Metadata } from "next";
import { SiteFooter, WhatsAppFloat } from "@/components/home/closing";
import { SiteHeader } from "@/components/home/site-header";
import { generalWaLink, getSettings, textVars } from "@/lib/settings";
import { renderHtml } from "@/lib/settings/sanitize";
import { OG_BASE } from "@/lib/site";
import { TERMS_CSS } from "./terms-css";

const description = "Syarat dan ketentuan layanan undangan pernikahan digital Sowanan: pemesanan, pembayaran, revisi, arsip permanen, dan kebijakan data tamu.";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description,
  alternates: { canonical: "/ketentuan" },
  robots: { index: true, follow: true },
  openGraph: { ...OG_BASE, title: "Syarat dan Ketentuan | Sowanan", description, url: "/ketentuan", images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Syarat dan Ketentuan | Sowanan", description },
};

export default async function TermsPage() {
  const s = await getSettings();
  const vars = textVars(s);
  const t = s.terms;
  const wa = generalWaLink(s);

  // Header, footer, dan tombol WhatsApp sama dengan beranda. Isi pasal memakai gaya dokumen di terms-css.
  return (
    <>
      <SiteHeader settings={s} waHref={wa} />
      <div className="terms">
        <style dangerouslySetInnerHTML={{ __html: TERMS_CSS }} />
        <main className="wrap">
          <h1>{t.title}</h1>
          <p className="updated">Berlaku sejak {t.date}</p>
          {t.intro && <div className="intro" dangerouslySetInnerHTML={{ __html: renderHtml(t.intro, vars) }} />}
          {t.articles
            .filter((a) => a.on)
            .map((a, i) => (
              <section key={a.id}>
                <h2>
                  {i + 1}. {a.title}
                </h2>
                <div dangerouslySetInnerHTML={{ __html: renderHtml(a.body, vars) }} />
              </section>
            ))}
        </main>
      </div>
      <SiteFooter settings={s} vars={vars} waHref={wa} />
      <WhatsAppFloat waHref={wa} />
    </>
  );
}
