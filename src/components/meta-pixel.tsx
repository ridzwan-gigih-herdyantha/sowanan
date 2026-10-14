"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  useEffect(() => {
    if (!PIXEL_ID) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href*="wa.me/"]');
      if (!link) return;
      window.fbq?.("track", "Lead");
      window.fbq?.("track", "Contact");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!PIXEL_ID) return null;

  return (
    <>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" alt="" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
      <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');if(window.self===window.top)fbq('track','PageView');window.dispatchEvent(new Event('fbq-ready'));`}
      </Script>
    </>
  );
}

// Skrip piksel dimuat setelah halaman selesai, jadi event yang terjadi lebih dulu menunggu sampai fbq siap.
function whenReady(send: () => void) {
  if (window.fbq) send();
  else window.addEventListener("fbq-ready", send, { once: true });
  return () => window.removeEventListener("fbq-ready", send);
}

// Satu ViewContent per tampilan demo tema. Undangan di dalam bingkai HP atau tablet tidak dihitung lagi karena
// halaman pembungkusnya sudah mengirim event yang sama.
export function TrackThemeView({ theme, name, pkg, device }: { theme: string; name: string; pkg: string; device: string }) {
  useEffect(() => {
    if (!PIXEL_ID || window.self !== window.top) return;
    return whenReady(() =>
      window.fbq?.("track", "ViewContent", { content_ids: [theme], content_name: name, content_type: "product", content_category: pkg, device }),
    );
  }, [theme, name, pkg, device]);
  return null;
}
