"use client";

import { useGuest } from "./shell";

export function GuestName({ fallback, className }: { fallback: string; className?: string }) {
  const { guest } = useGuest();
  return <span className={className}>{guest || fallback}</span>;
}
