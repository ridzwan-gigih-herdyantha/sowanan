"use client";

import { useSyncExternalStore } from "react";

// Ukuran logis ponsel. Undangan dirender selebar ini supaya layout HP-nya asli,
// lalu diskalakan supaya tingginya pas dari atas sampai bawah layar.
const W = 390;
const H = 844;

const subscribe = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const viewportHeight = () => window.innerHeight;

export function PhoneStage({ src, title }: { src: string; title: string }) {
  // 0 di server: iframe baru dipasang di browser, setelah skalanya diketahui, supaya tidak melompat ukuran.
  const height = useSyncExternalStore(subscribe, viewportHeight, () => 0);
  // Lebar dibulatkan ke piksel utuh supaya tepi layar tidak tercampur warna latar.
  const width = Math.floor((height * W) / H);
  const scale = width / W;
  return (
    <div className="relative mx-auto h-dvh overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,.45)]" style={{ width: width ? `${width}px` : `calc(100dvh * ${W / H})` }}>
      {height > 0 && (
        <iframe
          src={src}
          title={title}
          width={W}
          height={Math.ceil(height / scale)}
          className="absolute top-0 left-0 origin-top-left border-0"
          style={{ transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
