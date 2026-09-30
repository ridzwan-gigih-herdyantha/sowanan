import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { TERMS_CSS, TERMS_HTML } from "./terms-html";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Syarat dan ketentuan layanan undangan pernikahan digital Sowanan: pemesanan, pembayaran, revisi, masa aktif, dan kebijakan data tamu.",
  alternates: { canonical: "/ketentuan" },
  robots: { index: true, follow: true },
  openGraph: { title: "Syarat dan Ketentuan | Sowanan", url: "/ketentuan", images: [{ url: "/img/og.jpg", width: 1200, height: 630 }] },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// 6285877936091 menjadi +62 858-7793-6091
function prettyWa(n: string) {
  const local = n.replace(/^62/, "");
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
}

export default async function TermsPage() {
  const s = await getSettings();
  const html = TERMS_HTML.replaceAll("[TANGGAL BERLAKU]", esc(s.termsDate))
    .replaceAll("[NAMA REKENING]", esc(s.payAccountName))
    .replaceAll("[NOMOR-WA]", esc(s.waNumber))
    .replaceAll("[NOMOR WHATSAPP]", esc(prettyWa(s.waNumber)))
    .replaceAll("[AKUN-IG]", esc(s.instagram));

  return (
    <div className="terms">
      <style dangerouslySetInnerHTML={{ __html: TERMS_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
