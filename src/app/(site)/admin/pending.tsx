"use client";

import { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";

// Dipasang di dalam Link admin. Tautan admin tidak di-prefetch, jadi tanpa ini klik terasa tidak bereaksi
// sampai halaman tujuan selesai dimuat. Selama menunggu, garis berjalan muncul di tepi atas layar dan
// link yang diklik meredup lewat kelas has-[[data-pending]] di Link. Keduanya tidak menggeser layout.
export function Pending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <>
      <span data-pending hidden />
      {createPortal(
        <div role="progressbar" aria-label="Memuat halaman" className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-[admin-progress_1s_ease-in-out_infinite] bg-wine motion-reduce:w-full motion-reduce:animate-none" />
        </div>,
        document.body,
      )}
    </>
  );
}
