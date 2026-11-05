import { createClient } from "@supabase/supabase-js";
import { BUCKET } from "@/lib/storage/media";
import { createSiteUpload, finalizeSiteUpload } from "../settings/upload-actions";

type Upload = { ok: true; path: string; url: string } | { ok: false; error: string };

// Satu klien untuk semua unggahan di halaman ini. Supabase memperingatkan kalau klien dibuat berkali-kali.
let client: ReturnType<typeof createClient> | null = null;
const storage = () =>
  (client ??= createClient(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  })).storage.from(BUCKET);

// Unggah langsung ke storage lewat tiket, lalu server memperkecil dan menyimpannya di folder site/. Nomor berkas dihitung
// saat finalize, jadi beberapa gambar harus diunggah bergantian supaya tidak saling menimpa.
export async function uploadArticleImage(file: File, purpose: "artcover" | "artimg"): Promise<Upload> {
  const type = file.type || "application/octet-stream";
  try {
    const ticket = await createSiteUpload(type, file.size);
    if (!ticket.ok) return ticket;
    const { error } = await storage().uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: type });
    if (error) return { ok: false, error: "Upload terputus. Coba lagi." };
    const done = await finalizeSiteUpload(ticket.data.path, type, purpose);
    return done.ok ? { ok: true, ...done.data } : done;
  } catch {
    return { ok: false, error: "Gagal terhubung. Cek koneksi lalu coba lagi." };
  }
}
