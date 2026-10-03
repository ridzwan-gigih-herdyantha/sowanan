import type { Metadata } from "next";
import Link from "next/link";
import { fill, generalWaLink, getSettings, textVars } from "@/lib/settings";
import { renderHtml } from "@/lib/settings/sanitize";
import { TERMS_CSS } from "./terms-css";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Syarat dan ketentuan layanan undangan pernikahan digital Sowanan: pemesanan, pembayaran, revisi, masa aktif, dan kebijakan data tamu.",
  alternates: { canonical: "/ketentuan" },
  robots: { index: true, follow: true },
  openGraph: { title: "Syarat dan Ketentuan | Sowanan", url: "/ketentuan", images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
};

export default async function TermsPage() {
  const s = await getSettings();
  const vars = textVars(s);
  const t = s.terms;

  return (
    <div className="terms">
      <style dangerouslySetInnerHTML={{ __html: TERMS_CSS }} />
      <header className="nav">
        <div className="nav-in">
          <Link prefetch={false} className="brand" href="/">
            Sowanan<span>UNDANGAN PERNIKAHAN DIGITAL</span>
          </Link>
          <Link prefetch={false} className="back" href="/">
            Kembali ke beranda
          </Link>
        </div>
      </header>

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

      <footer className="foot">
        <div className="foot-in">
          <div>
            <div className="foot-brand">Sowanan</div>
            {s.footer.line1 && <div style={{ marginTop: 6 }}>{fill(s.footer.line1, vars)}</div>}
            {s.footer.line2 && <div style={{ marginTop: 6 }}>{fill(s.footer.line2, vars)}</div>}
          </div>
          <div>
            <Link prefetch={false} href="/">
              Beranda
            </Link>
            <a href={generalWaLink(s)}>WhatsApp</a>
            <a href={`https://instagram.com/${s.contact.instagram}`}>Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
