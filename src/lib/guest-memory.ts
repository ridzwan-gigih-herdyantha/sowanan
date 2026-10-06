// Ingatan tamu di HP-nya sendiri. Nama dari sapaan undangan, dan kode link pribadi (?k=) per undangan,
// supaya saat memindai QR mempelai di lokasi tamu langsung dikenali tanpa mengetik nama.
export const GUEST_KEY = "sowanan:guest";
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
