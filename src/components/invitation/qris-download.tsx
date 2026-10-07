"use client";

import { useEffect, useRef, useState } from "react";
import { isAppleMobile } from "@/lib/device";

// PNG berlatar putih supaya terbaca di semua galeri HP. Latar transparan bisa tampil hitam dan QR jadi tak terbaca.
async function toPng(src: string): Promise<Blob> {
  const blob = await (await fetch(src)).blob();
  try {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0);
    return await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"));
  } catch {
    return blob;
  }
}

function prepare(src: string, slug: string): Promise<File> {
  const p = toPng(src).then((b) => new File([b], `qris-${slug}.${b.type === "image/png" ? "png" : "webp"}`, { type: b.type }));
  p.catch(() => {});
  return p;
}

function save(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Di iPhone lewat lembar Bagikan supaya bisa disimpan ke Foto, karena unduhan Safari masuk ke Files.
// Gambar disiapkan lebih dulu, sebab Safari hanya mengizinkan lembar Bagikan dibuka tepat setelah ketukan.
export function QrisDownload({ src, slug }: { src: string; slug: string }) {
  const ready = useRef<Promise<File> | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  useEffect(() => {
    ready.current = prepare(src, slug);
  }, [src, slug]);

  const download = async () => {
    setState("busy");
    try {
      const file = await (ready.current ?? Promise.reject(new Error("belum siap")));
      if (isAppleMobile() && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
        } catch (e) {
          if ((e as Error).name !== "AbortError") save(file);
        }
      } else save(file);
      setState("idle");
    } catch {
      // Misalnya sinyal putus. Ketukan berikutnya menyiapkan ulang gambarnya.
      ready.current = prepare(src, slug);
      setState("error");
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={state === "busy"}
      className="mt-3 rounded-sm border border-inv-accent px-4 py-2 text-[12px] tracking-[0.14em] text-inv-accent transition-colors duration-150 hover:bg-inv-accent hover:text-inv-paper disabled:opacity-60"
    >
      <span aria-live="polite">{state === "busy" ? "MENYIAPKAN..." : state === "error" ? "GAGAL, COBA LAGI" : "UNDUH QRIS"}</span>
    </button>
  );
}
