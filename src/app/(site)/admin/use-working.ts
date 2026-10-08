"use client";

import { useRef, useState } from "react";

export const OFFLINE = "Gagal terhubung. Cek koneksi lalu coba lagi.";

// Aksi admin yang menunggu server. key menandai tombol yang sedang memproses, supaya hanya tombol itu
// yang menampilkan teks memuat. Selama satu aksi berjalan, klik lain diabaikan supaya tidak terkirim dua kali.
// Koneksi putus membuat aksi server melempar error, jadi ditangkap dan diteruskan sebagai pesan.
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
