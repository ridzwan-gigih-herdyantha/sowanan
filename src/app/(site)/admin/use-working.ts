"use client";

import { useRef, useState } from "react";

export const OFFLINE = "Gagal terhubung. Cek koneksi lalu coba lagi.";

// key menandai tombol yang sedang memproses, jadi hanya tombol itu yang tampil memuat. Klik lain diabaikan
// selama aksi berjalan supaya tidak terkirim dua kali. Error karena koneksi putus ditangkap jadi pesan.
export function useWorking(onError: (message: string) => void) {
  const [working, setWorking] = useState<string | null>(null);
  const busy = useRef(false);
  const run = async (key: string, fn: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setWorking(key);
    try {
      await fn();
    } catch {
      onError(OFFLINE);
    } finally {
      busy.current = false;
      setWorking(null);
    }
  };
  return { working, run };
}
