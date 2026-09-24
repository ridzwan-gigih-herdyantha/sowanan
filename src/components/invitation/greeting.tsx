"use client";

import { useGuest } from "./shell";

export function Greeting({ className }: { className?: string }) {
  const { guest } = useGuest();
  if (!guest) return null;
  return (
    <p className={className}>
      Halo, {guest}. Kursimu sudah kami siapkan.
    </p>
  );
}
