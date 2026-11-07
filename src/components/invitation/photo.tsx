import NextImage, { type ImageProps } from "next/image";

// Tempat foto saat undangan tidak memakai foto: warna tema dengan monogram mempelai, supaya tidak ada kotak kosong.
export function NoPhoto({ className = "absolute inset-0 size-full", style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden="true" className={`inv-no-photo ${className}`} style={style} />;
}

// Pengganti next/image untuk foto undangan. Foto selebar layar adalah latar section dengan teks di atasnya, jadi
// tanpa foto cukup warna latar section itu sendiri.
export default function Image(props: ImageProps) {
  const { src, fill, sizes, className, width, height } = props;
  if (src) return <NextImage {...props} />;
  if (fill) return sizes === "100vw" ? null : <NoPhoto className={`absolute inset-0 size-full ${className ?? ""}`} />;
  return <NoPhoto className={className} style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }} />;
}
