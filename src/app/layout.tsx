import type { Metadata } from "next";
import { MetaPixel } from "@/components/meta-pixel";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Undangan Pernikahan Digital`, template: `%s | ${SITE_NAME}` },
  openGraph: { siteName: SITE_NAME, locale: "id_ID", type: "website" },
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
