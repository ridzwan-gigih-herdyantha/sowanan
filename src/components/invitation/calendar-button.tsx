"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { isAppleMobile } from "@/lib/device";

const noop = () => () => {};

// iPhone dan iPad membuka berkas .ics langsung di Kalender Apple. Perangkat lain memakai Google Calendar.
export function CalendarButton({ slug, google, className, children }: { slug: string; google: string; className?: string; children: ReactNode }) {
  const apple = useSyncExternalStore(noop, isAppleMobile, () => false);
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
