import { getImageProps } from "next/image";
import type { FrameProps } from "@/lib/invitation/frame";

// Foto layar penuh Lensa: potret di HP, lebar di layar besar. Dipakai pembuka dan hero dengan susunan sama persis,
// supaya saat pembuka dilepas tidak ada pergeseran sedikit pun.
export function LensaPhoto({ portrait, wide, frame, alt, className = "", priority = false }: { portrait: string; wide: string; frame?: FrameProps; alt: string; className?: string; priority?: boolean }) {
  const common = { alt, sizes: "100vw", ...(priority ? { fetchPriority: "high" as const, loading: "eager" as const } : {}) };
  const { props: { srcSet: wideSet } } = getImageProps({ ...common, src: wide, width: 2400, height: 1600 });
  const { props: { srcSet, ...rest } } = getImageProps({ ...common, src: portrait, width: 1600, height: 2135 });
  return (
    <picture>
      <source media="(min-aspect-ratio: 1/1)" srcSet={wideSet} sizes="100vw" />
      <img {...rest} {...frame} style={{ ...rest.style, ...frame?.style }} srcSet={srcSet} sizes="100vw" alt={alt} className={`absolute inset-0 size-full object-cover object-[50%_40%] ${className}`} />
    </picture>
  );
}

// Lapisan gelap tipis di atas dan bawah foto, supaya teks putih terbaca di foto apa pun.
export const SCRIM = "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,.12) 34%, rgba(0,0,0,0) 55%, rgba(0,0,0,.42) 100%)";
