"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};
const inFrame = () => window.self !== window.top;

const svg = (children: ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {children}
  </svg>
);
const monitor = svg(
  <>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M9 20h6M12 16v4" />
  </>,
);
const tablet = svg(
  <>
    <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
    <path d="M11 18.5h2" />
  </>,
);
const phone = svg(
  <>
    <rect x="7" y="2.5" width="10" height="19" rx="2" />
    <path d="M11 18.5h2" />
  </>,
);

export type DemoView = "desktop" | "tablet" | "hp";

function Item({ href, on, icon, label }: { href: string; on: boolean; icon: ReactNode; label: string }) {
  return (
    <a
      href={href}
      aria-current={on ? "page" : undefined}
      className={`flex size-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] no-underline transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        on ? "bg-paper text-night" : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

// Undangan contoh di layar lebar: pindah antara tampilan desktop, tablet, dan HP. Di mode desktop menempel di tepi
// kanan layar, di mode tablet dan HP menempel di samping layar perangkatnya (attached, posisinya diatur induk).
// Disembunyikan di dalam layar perangkat itu sendiri supaya tidak muncul dua kali. Memakai <a> biasa, bukan Link,
// karena Link menyimpan halaman sebelumnya secara tersembunyi sehingga musik latarnya bisa tetap berbunyi.
export function DemoViewSwitch({ slug, mode, attached }: { slug: string; mode: DemoView; attached?: boolean }) {
  const framed = useSyncExternalStore(noop, inFrame, () => false);
  // Di dalam layar perangkat, scrollbar disembunyikan seperti di HP dan tablet sungguhan.
  useEffect(() => {
    if (!framed) return;
    document.documentElement.dataset.deviceFrame = "";
    return () => {
      delete document.documentElement.dataset.deviceFrame;
    };
  }, [framed]);
  if (framed) return null;
  return (
    <nav
      aria-label="Tampilan contoh undangan"
      className={`${attached ? "" : "fixed top-1/2 right-4 z-70 -translate-y-1/2"} hidden flex-col gap-1 rounded-full bg-night/90 p-1.5 font-sans shadow-[0_8px_24px_rgba(0,0,0,.25)] backdrop-blur lg:flex`}
    >
      <Item href={`/${slug}`} on={mode === "desktop"} icon={monitor} label="Desktop" />
      <Item href={`/${slug}/tablet`} on={mode === "tablet"} icon={tablet} label="Tablet" />
      <Item href={`/${slug}/hp`} on={mode === "hp"} icon={phone} label="HP" />
    </nav>
  );
}
