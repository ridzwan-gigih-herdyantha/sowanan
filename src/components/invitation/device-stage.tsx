"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const viewportHeight = () => window.innerHeight;

// Undangan dirender seukuran layar logis perangkat (w x h) supaya layout-nya asli, lalu diskalakan
// supaya tingginya pas dari atas sampai bawah layar. aside melayang di atas layar perangkat, dan variabel CSS-nya
// menyamakan posisi serta ukurannya dengan tombol WA dan musik di dalam iframe, yang ikut diskalakan.
export function DeviceStage({ src, title, w, h, aside }: { src: string; title: string; w: number; h: number; aside?: ReactNode }) {
  // 0 di server: iframe baru dipasang di browser, setelah skalanya diketahui, supaya tidak melompat ukuran.
  const height = useSyncExternalStore(subscribe, viewportHeight, () => 0);
  // Lebar dibulatkan ke piksel utuh supaya tepi layar tidak tercampur warna latar.
  const width = Math.floor((height * w) / h);
  const scale = width / w;
  // Breakpoint sm tombol-tombol di dalam iframe mengikuti lebar logis perangkat.
  const wide = w >= 640;
  const px = (n: number) => `${n * scale}px`;
  return (
    <div className="relative mx-auto h-dvh" style={{ width: width ? `${width}px` : `calc(100dvh * ${w / h})` }}>
      <div className="absolute inset-0 overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,.45)]">
        {height > 0 && (
          <iframe
            data-device-screen
            src={src}
            title={title}
            width={w}
            height={Math.ceil(height / scale)}
            className="absolute top-0 left-0 origin-top-left border-0"
            style={{ transform: `scale(${scale})` }}
          />
        )}
      </div>
      {aside && height > 0 && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ "--demo-right": px(wide ? 24 : 16), "--demo-cover": px(wide ? 24 : 16), "--demo-inside": px(wide ? 168 : 144), "--demo-size": px(48) } as CSSProperties}
        >
          {aside}
        </div>
      )}
    </div>
  );
}
