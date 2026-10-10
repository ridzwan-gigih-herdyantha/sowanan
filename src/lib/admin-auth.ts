import "server-only";
import type { User } from "@supabase/supabase-js";
import { hasSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

// Peran disimpan di app_metadata, yang hanya bisa diubah lewat service role, bukan oleh pengguna sendiri.
// Akun mempelai juga login lewat Supabase, jadi sekadar sudah login belum berarti admin.
export const isAdminUser = (user: User | null | undefined): user is User => user?.app_metadata?.role === "admin";

export async function currentAdmin(): Promise<User | null> {
  if (!hasSupabase()) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return isAdminUser(data.user) ? data.user : null;
}
