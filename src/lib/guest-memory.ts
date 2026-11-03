// Ingatan tamu di HP-nya sendiri. Nama dari sapaan dan kode link pribadi (?k=), dipisah per undangan,
// supaya saat memindai QR mempelai di lokasi tamu langsung dikenali tanpa mengetik nama.
export const guestNameKey = (slug: string) => `sowanan:guest:${slug}`;
export const guestCodeKey = (slug: string) => `sowanan:k:${slug}`;

export function recall(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
