"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Tombol pesan di undangan contoh. Baru muncul setelah pembuka dibuka supaya tidak bersaing dengan tombol di cover,
// di atas tombol musik, dan menghilang saat menimpa formulir RSVP. Dipantau berkala karena tema game menaruh RSVP
// di panel yang baru dibuat saat dikunjungi. Event Lead piksel sudah terkirim otomatis untuk semua tautan WhatsApp,
// jadi di sini cukup GA4.
export function DemoOrderButton({ href, theme, children }: { href: string; theme: string; children: ReactNode }) {
  const button = useRef<HTMLAnchorElement>(null);
  const [opened, setOpened] = useState(false);
  const [covering, setCovering] = useState(false);

  useEffect(() => {
    const check = () => {
      setOpened(document.querySelector("[data-inv-state]")?.getAttribute("data-inv-state") === "open");
      const b = button.current?.getBoundingClientRect();
      if (!b) return;
      setCovering(
        [...document.querySelectorAll("[data-inv-rsvp]")].some((form) => {
          const f = form.getBoundingClientRect();
          return f.width > 0 && f.left < b.right && f.right > b.left && f.top < b.bottom && f.bottom > b.top;
        }),
      );
    };
    check();
    const t = window.setInterval(check, 300);
    return () => window.clearInterval(t);
  }, []);

  const shown = opened && !covering;
  return (
    <a
      ref={button}
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Pesan tema ini lewat WhatsApp"
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
      onClick={() => window.gtag?.("event", "klik_whatsapp", { tema: theme, posisi: "demo" })}
      className={`fixed right-4 bottom-20 z-40 flex size-12 items-center justify-center rounded-full bg-wa text-white no-underline shadow-[0_6px_20px_rgba(0,0,0,.3)] transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:bottom-24 ${shown ? "opacity-100" : "pointer-events-none invisible opacity-0"}`}
    >
      {children}
    </a>
  );
}
