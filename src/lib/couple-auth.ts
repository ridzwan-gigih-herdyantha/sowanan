import "server-only";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type CoupleInvitation = { id: string; slug: string; theme: string; data: unknown; published: boolean; package: string | null };
export type Couple = { user: User; invitations: CoupleInvitation[] };

// Mempelai yang sedang masuk beserta undangan yang boleh dibukanya. Akses selalu dihitung dari
// invitation_members, bukan dari alamat yang dibuka.
export async function currentCouple(): Promise<Couple | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (user?.app_metadata?.role !== "mempelai") return null;
  const { data: rows } = await supabaseAdmin()
    .from("invitation_members")
    .select("invitations(id, slug, theme, data, published, package)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const invitations = (rows ?? []).flatMap((r) => (r.invitations ? [r.invitations as unknown as CoupleInvitation] : []));
  return { user, invitations };
}

// Undangan milik mempelai yang sedang masuk. Undangan orang lain dianggap tidak ada.
export async function coupleInvitation(slug: string): Promise<{ couple: Couple; invitation: CoupleInvitation } | null> {
  const couple = await currentCouple();
  const invitation = couple?.invitations.find((i) => i.slug === slug);
  return couple && invitation ? { couple, invitation } : null;
}
