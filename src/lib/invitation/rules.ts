import "server-only";
import { getSettingsFresh, packageRules, type PackageRules, type Purchased } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Row = { theme: string; package?: string | null; addons?: Purchased };

// Aturan paket satu undangan. Kolom addons (migrasi 0007) bisa belum ada, jadi dicoba bertahap.
export async function invitationRules(slug: string): Promise<{ theme: string; rules: PackageRules } | null> {
  for (const cols of ["theme, package, addons", "theme, package"]) {
    const { data, error } = await supabaseAdmin().from("invitations").select(cols).eq("slug", slug).maybeSingle();
    if (error) continue;
    if (!data) return null;
    const row = data as unknown as Row;
    return { theme: row.theme, rules: packageRules(await getSettingsFresh(), row.package ?? null, row.addons ?? {}) };
  }
  return null;
}
