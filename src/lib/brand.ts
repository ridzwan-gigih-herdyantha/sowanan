// Logo Sowanan: pintu lengkung yang dibelah celah tegak. Diukur dari berkas logo asli (172 x 224),
// lengkungnya setengah lingkaran berjari-jari 86 dan celahnya selebar 38.
export const MARK_VIEWBOX = "0 0 172 224";
export const MARK_PATH = "M0 224V86A86 86 0 0 1 67 2.13V224ZM105 2.13A86 86 0 0 1 172 86V224H105Z";

export const BRAND = { wine: "#7C2B3E", ivory: "#FAF7F2" };

// Ikon aplikasi 176 x 176: kotak wine bersudut membulat, logo ivory di tengah (posisi sesuai berkas asli).
export function iconSvg({ rounded = true, size = 512 }: { rounded?: boolean; size?: number } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 176 176"><rect width="176" height="176" rx="${rounded ? 36 : 0}" fill="${BRAND.wine}"/><path transform="translate(48.5 35) scale(0.4593)" fill="${BRAND.ivory}" d="${MARK_PATH}"/></svg>`;
}
