// Stylesheet font custom dari Google Fonts. Font pilihan klien tidak bisa di-host next/font karena baru diketahui
// saat undangan dibuka. Precedence membuat React memindahkannya ke head dan tidak memuat dua kali.
export function CustomFontLinks({ hrefs }: { hrefs: string[] }) {
  return hrefs.map((href) => <link key={href} rel="stylesheet" href={href} precedence="custom-font" />);
}
