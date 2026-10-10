import "server-only";
import { updateTag } from "next/cache";
import { wishesTag } from "@/lib/guestbook";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type WishRow = { id: number; name: string; message: string; created_at: string; hidden_at: string | null; hidden_by: "admin" | "mempelai" | null };

// Semua ucapan satu undangan untuk admin dan mempelai, termasuk yang disembunyikan.
export async function listWishes(invitationId: string): Promise<WishRow[]> {
  const { data } = await supabaseAdmin()
    .from("wishes")
    .select("id, name, message, created_at, hidden_at, hidden_by")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false })
    .limit(5000);
  return (data ?? []) as WishRow[];
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
  if (error) return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  if (!data.length) return { ok: false, error: "Ucapan tidak ditemukan." };
  updateTag(wishesTag(slug));
  return { ok: true, hiddenAt };
}
