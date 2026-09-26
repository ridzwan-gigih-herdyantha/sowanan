import "server-only";
import type { User } from "@supabase/supabase-js";
import { hasSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export async function currentAdmin(): Promise<User | null> {
  if (!hasSupabase()) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
