"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};
// iPhone dan iPad membuka berkas .ics langsung di Kalender Apple. Perangkat lain memakai Google Calendar.
// iPad modern mengaku Macintosh, jadi dikenali dari layar sentuhnya.
const isApple = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 0);

export function CalendarButton({ slug, google, className, children }: { slug: string; google: string; className?: string; children: ReactNode }) {
  const apple = useSyncExternalStore(noop, isApple, () => false);
  return apple ? (
    <a href={`/${slug}/kalender`} className={className}>
      {children}
    </a>
  ) : (
    <a href={google} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
}
