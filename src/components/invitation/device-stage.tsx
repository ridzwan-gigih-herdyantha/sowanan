"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const viewportHeight = () => window.innerHeight;

// Undangan dirender seukuran layar logis perangkat (w x h) supaya layout-nya asli, lalu diskalakan
// supaya tingginya pas dari atas sampai bawah layar. aside menempel di samping kanan layar perangkat.
export function DeviceStage({ src, title, w, h, aside }: { src: string; title: string; w: number; h: number; aside?: ReactNode }) {
  // 0 di server: iframe baru dipasang di browser, setelah skalanya diketahui, supaya tidak melompat ukuran.
  const height = useSyncExternalStore(subscribe, viewportHeight, () => 0);
  // Lebar dibulatkan ke piksel utuh supaya tepi layar tidak tercampur warna latar.
  const width = Math.floor((height * w) / h);
  const scale = width / w;
  return (
    <div className="relative mx-auto h-dvh" style={{ width: width ? `${width}px` : `calc(100dvh * ${w / h})` }}>
      <div className="absolute inset-0 overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,.45)]">
        {height > 0 && (
          <iframe
            src={src}
            title={title}
            width={w}
            height={Math.ceil(height / scale)}
            className="absolute top-0 left-0 origin-top-left border-0"
            style={{ transform: `scale(${scale})` }}
          />
        )}
      </div>
      {aside && <div className="absolute top-1/2 left-full z-10 ml-5 -translate-y-1/2">{aside}</div>}
    </div>
  );
}
