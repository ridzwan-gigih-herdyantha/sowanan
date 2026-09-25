import type { Metadata } from "next";
import { MetaPixel } from "@/components/meta-pixel";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Undangan Pernikahan Digital`, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  other: process.env.META_DOMAIN_VERIFICATION
    ? { "facebook-domain-verification": process.env.META_DOMAIN_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
