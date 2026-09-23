import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { MetaPixel } from "@/components/meta-pixel";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Undangan Pernikahan Digital`, template: `%s | ${SITE_NAME}` },
  openGraph: { siteName: SITE_NAME, locale: "id_ID", type: "website" },
  // Verifikasi domain Meta Business Portfolio (PRD 2.6)
  other: process.env.META_DOMAIN_VERIFICATION
    ? { "facebook-domain-verification": process.env.META_DOMAIN_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
