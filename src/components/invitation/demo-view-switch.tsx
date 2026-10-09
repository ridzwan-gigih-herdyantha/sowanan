"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};
const inFrame = () => window.self !== window.top;

const svg = (children: ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    {children}
  </svg>
);
const DEVICES = {
  desktop: {
    label: "Desktop",
    icon: svg(
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M9 20h6M12 16v4" />
      </>,
    ),
  },
  tablet: {
    label: "Tablet",
    icon: svg(
      <>
        <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </>,
    ),
  },
  hp: {
    label: "HP",
    icon: svg(
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </>,
    ),
  },
} as const;

export type DemoView = keyof typeof DEVICES;
type PackageLink = { id: string; name: string; href: string; on: boolean; available: boolean; note?: string };
type DeviceLink = { id: DemoView; href: string; on: boolean };

const item = "flex size-10 flex-col items-center justify-center gap-0.5 rounded-lg text-[9px] no-underline transition-colors duration-150 lg:size-12 lg:text-[10px]";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const tone = (on: boolean) => (on ? "bg-paper text-night" : "text-white/75 hover:bg-white/10 hover:text-white");

// Undangan contoh: pilih paket (isi undangan mengikuti aturan paket itu) dan, di layar lebar, pilih tampilan desktop,
// tablet, atau HP. Di mode desktop menempel di tepi kanan layar, di mode tablet dan HP menempel di samping layar
// perangkatnya (attached, posisinya diatur induk). Disembunyikan di dalam layar perangkat supaya tidak muncul dua kali.
// Dibuat kecil dan agak transparan supaya tidak menutupi undangan.
// Memakai <a> biasa, bukan Link, karena Link menyimpan halaman sebelumnya secara tersembunyi sehingga musik latarnya bisa tetap berbunyi.
export function DemoViewSwitch({ packages = [], devices, attached }: { packages?: PackageLink[]; devices: DeviceLink[]; attached?: boolean }) {
  // null sampai hidrasi selesai, supaya tidak sempat muncul di dalam layar perangkat.
  const framed = useSyncExternalStore(noop, inFrame, () => null);
  // Di dalam layar perangkat, scrollbar disembunyikan seperti di HP dan tablet sungguhan.
  useEffect(() => {
    if (framed !== true) return;
    document.documentElement.dataset.deviceFrame = "";
    return () => {
      delete document.documentElement.dataset.deviceFrame;
    };
  }, [framed]);
  if (framed !== false) return null;
  const withPackages = packages.length > 1;
  return (
    <nav
      aria-label="Contoh undangan"
      className={`${attached ? "" : "fixed top-1/2 right-2 z-70 -translate-y-1/2 lg:right-4"} ${withPackages ? "flex" : "hidden lg:flex"} flex-col gap-0.5 rounded-xl bg-night/90 p-1 font-sans opacity-80 shadow-[0_8px_24px_rgba(0,0,0,.25)] backdrop-blur`}
    >
      {withPackages && (
        <>
          <p className="pt-1 text-center text-[9px] text-white/55">Paket</p>
          {packages.map((p) =>
            p.available ? (
              <a key={p.id} href={p.href} aria-current={p.on ? "page" : undefined} className={`${item} ${focus} ${tone(p.on)}`}>
                {p.name}
              </a>
            ) : (
              <span key={p.id} aria-disabled="true" title={p.note} className={`${item} cursor-not-allowed text-white/30`}>
                {p.name}
                <span className="sr-only">, {p.note}</span>
              </span>
            ),
          )}
        </>
      )}
      <div className="hidden flex-col gap-0.5 lg:flex">
        {withPackages && (
          <>
            <span aria-hidden="true" className="mx-2.5 my-1 h-px bg-white/15" />
            <p className="text-center text-[9px] text-white/55">Tampilan</p>
          </>
        )}
        {devices.map((d) => (
          <a key={d.id} href={d.href} aria-current={d.on ? "page" : undefined} className={`${item} ${focus} ${tone(d.on)}`}>
            {DEVICES[d.id].icon}
            {DEVICES[d.id].label}
          </a>
        ))}
      </div>
    </nav>
  );
}
