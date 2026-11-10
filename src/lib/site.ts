// Garis miring di ujung dibuang, supaya alamat yang disambung seperti `${SITE_URL}/dashboard` tidak jadi dobel garis miring.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://sowanan.com").replace(/\/+$/, "");
export const SITE_NAME = "Sowanan";

// openGraph di halaman menimpa milik layout, tidak digabung. Halaman yang mengisi openGraph wajib menyertakan ini.
export const OG_BASE = { siteName: SITE_NAME, locale: "id_ID", type: "website" } as const;
