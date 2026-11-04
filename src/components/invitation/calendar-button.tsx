"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { isAppleMobile } from "@/lib/device";
import { linkCode } from "@/lib/guest-memory";

const noop = () => () => {};

// iPhone dan iPad membuka berkas .ics langsung di Kalender Apple. Perangkat lain memakai Google Calendar.
export function CalendarButton({ slug, google, className, children }: { slug: string; google: string; className?: string; children: ReactNode }) {
  const apple = useSyncExternalStore(noop, isAppleMobile, () => false);
  const code = useSyncExternalStore(noop, linkCode, () => "");
  return apple ? (
    <a href={`/${slug}/kalender${code ? `?k=${encodeURIComponent(code)}` : ""}`} className={className}>
      {children}
    </a>
  ) : (
    <a href={google} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
}
