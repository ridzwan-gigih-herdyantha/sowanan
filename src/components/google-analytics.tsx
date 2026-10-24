"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9Y22VZ9F6Y";

// Halaman internal tidak dihitung supaya statistik hanya berisi pengunjung dan tamu.
const INTERNAL = /^\/(admin|dashboard)(\/|$)/;

// Google Analytics 4, hanya di produksi. Perpindahan halaman di app router tercatat lewat enhanced measurement.
export function GoogleAnalytics() {
  const pathname = usePathname();
  if (process.env.NODE_ENV !== "production" || !GA_ID || INTERNAL.test(pathname)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
