"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => { };
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
const divider = <span aria-hidden="true" className="mx-2.5 my-1 h-px bg-white/15" />;

// Browser dalam aplikasi sering tidak menyediakan clipboard modern, jadi ada cara lama sebagai cadangan.
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.className = "fixed top-0 left-0 opacity-0";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }
}

function CopyDataButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const copy = async () => {
    setState((await copyToClipboard(text)) ? "done" : "failed");
    setTimeout(() => setState("idle"), 1600);
  };
  return (
    <button type="button" onClick={copy} title="Salin daftar data tema ini untuk WhatsApp" className={`${item} ${focus} ${tone(false)} cursor-pointer`}>
      {svg(
        state === "done" ? (
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        ) : (
          <>
            <rect x="8.5" y="8.5" width="11" height="12" rx="1.5" />
            <path d="M15.5 8.5v-3a1.5 1.5 0 0 0-1.5-1.5H6a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 6 17h2.5" />
          </>
        ),
      )}
      <span aria-live="polite">{state === "done" ? "Tersalin" : state === "failed" ? "Gagal" : "Salin"}</span>
      <span className="sr-only"> daftar data untuk WhatsApp</span>
    </button>
  );
}

// Pilih paket dan tampilan desktop, tablet, atau HP, serta salin daftar data tema. Disembunyikan di dalam layar
// perangkat supaya tidak dobel.
// <a> biasa, bukan Link, karena Link menyimpan halaman lama sehingga musik latarnya bisa tetap berbunyi.
export function DemoViewSwitch({ packages = [], devices, dataList, attached }: { packages?: PackageLink[]; devices: DeviceLink[]; dataList?: string; attached?: boolean }) {
  // null sampai hidrasi selesai, supaya tidak sempat muncul di dalam layar perangkat.
  const framed = useSyncExternalStore(noop, inFrame, () => null);
  const [open, setOpen] = useState(false);
  const [inside, setInside] = useState(false);

  // Di cover menempati posisi tombol musik, di dalam undangan naik ke atas tombol WA. Saat ditempel ke layar perangkat,
  // undangannya ada di dalam iframe.
  useEffect(() => {
    if (framed !== false) return;
    const check = () => {
      const doc = attached ? document.querySelector<HTMLIFrameElement>("[data-device-screen]")?.contentDocument : document;
      setInside(doc?.querySelector("[data-inv-state]")?.getAttribute("data-inv-state") === "open");
    };
    check();
    const t = window.setInterval(check, 300);
    return () => window.clearInterval(t);
  }, [framed, attached]);

  // Di dalam layar perangkat, scrollbar disembunyikan seperti di HP dan tablet sungguhan.
  useEffect(() => {
    if (framed !== true) return;
    document.documentElement.dataset.deviceFrame = "";
    return () => {
      delete document.documentElement.dataset.deviceFrame;
    };
  }, [framed]);

  // Tutup dengan tombol Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (framed !== false) return null;

  const withPackages = packages.length > 1;
  const position = attached
    ? `pointer-events-auto absolute right-(--demo-right) ${inside ? "bottom-(--demo-inside)" : "bottom-(--demo-cover)"}`
    : `fixed right-4 z-70 sm:right-6 ${inside ? "bottom-36 sm:bottom-42" : "bottom-4 sm:bottom-6"}`;

  return (
    <div className={`${position} ${withPackages || dataList ? "flex" : "hidden lg:flex"} flex-col items-end gap-2 font-sans transition-[bottom] duration-200 motion-reduce:transition-none`}>
      {open && (
        <nav
          id="demo-switch-panel"
          aria-label="Contoh undangan"
          className="flex max-h-[60vh] flex-col gap-0.5 overflow-y-auto rounded-xl bg-night/90 p-1 opacity-95 shadow-[0_8px_24px_rgba(0,0,0,.25)] backdrop-blur"
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

          {dataList && (
            <>
              {withPackages && divider}
              <p className={`text-center text-[9px] text-white/55 ${withPackages ? "" : "pt-1"}`}>Data</p>
              <CopyDataButton text={dataList} />
            </>
          )}

          <div className="hidden flex-col gap-0.5 lg:flex">
            {(withPackages || dataList) && (
              <>
                {divider}
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
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="demo-switch-panel"
        aria-label={open ? "Tutup menu contoh" : "Buka menu contoh"}
        className={`${focus} ${attached ? "size-(--demo-size)" : "size-12"} flex cursor-pointer items-center justify-center rounded-full bg-night/90 text-white shadow-[0_8px_24px_rgba(0,0,0,.25)] backdrop-blur transition-colors duration-150 hover:bg-night`}
      >
        {svg(open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />)}
      </button>
    </div>
  );
}
