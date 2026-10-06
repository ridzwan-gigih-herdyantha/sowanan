"use client";

import { useEffect, useState } from "react";

// QR selalu hitam di atas putih dengan tepi lebar, supaya mudah dipindai di bawah lampu gedung.
export async function qrDataUrl(value: string, width = 640) {
  const { toDataURL } = await import("qrcode");
  return toDataURL(value, { width, margin: 2, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#FFFFFF" } });
}

export function QrCode({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    qrDataUrl(value).then((url) => live && setSrc(url));
    return () => {
      live = false;
    };
  }, [value]);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={label} width={640} height={640} className={`block h-auto w-full bg-white ${className}`} />
  ) : (
    <div role="img" aria-label={label} className={`aspect-square w-full animate-pulse bg-white ${className}`} />
  );
}

export async function downloadQr(value: string, fileName: string) {
  const a = document.createElement("a");
  a.href = await qrDataUrl(value, 1024);
  a.download = fileName;
  a.click();
}
