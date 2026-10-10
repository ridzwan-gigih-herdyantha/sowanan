import "server-only";
import { getSettingsFresh, packageRules, type PackageRules, type Purchased } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Row = { theme: string; package: string | null; addons: Purchased | null };

// Aturan paket satu undangan.
export async function invitationRules(slug: string): Promise<{ theme: string; rules: PackageRules } | null> {
  const { data } = await supabaseAdmin().from("invitations").select("theme, package, addons").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const row = data as Row;
  return { theme: row.theme, rules: packageRules(await getSettingsFresh(), row.package ?? null, row.addons ?? {}) };
}
