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
  // Link berisi kode tamu (?k=) tidak dihitung, karena GA mencatat alamat lengkap dan kode tidak boleh keluar.
  // Diperiksa di skrip browser, bukan useSearchParams, supaya halaman statis tetap statis.
  return (
    <Script id="google-analytics" strategy="afterInteractive">
      {`if(!/[?&]k=/.test(location.search)){
var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s);
window.dataLayer = window.dataLayer || [];
window.gtag=function(){dataLayer.push(arguments);};
gtag('js', new Date());
gtag('config', '${GA_ID}');
}`}
    </Script>
  );
}
