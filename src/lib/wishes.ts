import "server-only";
import { updateTag } from "next/cache";
import { wishesTag } from "@/lib/guestbook";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type WishRow = { id: number; name: string; message: string; created_at: string; hidden_at: string | null; hidden_by: "admin" | "mempelai" | null };

// Kolom hidden_at dan hidden_by (migrasi 0011) bisa belum ada. Kode Postgres 42703 berarti kolom tidak dikenal.
export const missingColumn = (e: { code?: string; message?: string } | null) => e?.code === "42703" || /hidden_(at|by)/.test(e?.message ?? "");

// Semua ucapan satu undangan untuk admin dan mempelai, termasuk yang disembunyikan.
export async function listWishes(invitationId: string): Promise<WishRow[]> {
  const sb = supabaseAdmin();
  const full = await sb.from("wishes").select("id, name, message, created_at, hidden_at, hidden_by").eq("invitation_id", invitationId).order("created_at", { ascending: false }).limit(5000);
  if (!full.error) return full.data as WishRow[];
  if (!missingColumn(full.error)) return [];
  const basic = await sb.from("wishes").select("id, name, message, created_at").eq("invitation_id", invitationId).order("created_at", { ascending: false }).limit(5000);
  return (basic.data ?? []).map((w) => ({ ...w, hidden_at: null, hidden_by: null }));
}

export type HideResult = { ok: true; hiddenAt: string | null } | { ok: false; error: string };

// Sembunyikan atau tampilkan lagi satu ucapan. Ucapan harus milik undangan itu, jadi id dari luar tidak bisa
// dipakai untuk mengubah ucapan undangan lain.
export async function setWishHidden(slug: string, invitationId: string, wishId: number, hidden: boolean, by: "admin" | "mempelai"): Promise<HideResult> {
  const hiddenAt = hidden ? new Date().toISOString() : null;
  const { data, error } = await supabaseAdmin()
    .from("wishes")
    .update({ hidden_at: hiddenAt, hidden_by: hidden ? by : null })
    .eq("id", wishId)
    .eq("invitation_id", invitationId)
    .select("id");
  if (error) return { ok: false, error: missingColumn(error) ? "Fitur ini butuh migrasi 0011 di database." : "Gagal menyimpan. Coba lagi." };
  if (!data.length) return { ok: false, error: "Ucapan tidak ditemukan." };
  updateTag(wishesTag(slug));
  return { ok: true, hiddenAt };
}
