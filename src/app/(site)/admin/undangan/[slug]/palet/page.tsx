import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { CUSTOM, type Vars } from "@/themes/palette";
import { PALETTES, resolvePalette } from "@/themes/palettes";
import { LoginForm } from "../../../login-form";
import { InvitationTabs } from "../../tabs";
import { PaletteSheet, type SheetPalette } from "./palette-sheet";

export const metadata: Metadata = {
  title: "Palet warna",
  robots: { index: false, follow: false },
};

async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  if (!(await currentAdmin())) return <LoginForm />;

  const { slug } = await params;
  const { data: row } = await supabaseAdmin().from("invitations").select("slug, theme, data, draft").eq("slug", slug).maybeSingle();
  const p = row && PALETTES[row.theme];
  if (!row || !THEME_NAMES[row.theme] || !p) notFound();

  // Palet yang dipakai mengikuti draf, karena itu yang sedang dikerjakan admin.
  const style = invitationDataSchema.parse(row.draft ?? row.data ?? {}).style;
  const active = style.palette || p.presets[0].id;
  const colors = (v: Vars) => p.roles.map((r) => ({ label: r.label, hex: v[r.key] }));
  const palettes: SheetPalette[] = p.presets.map((x, i) => ({ id: x.id, name: i === 0 ? `${x.name} (bawaan)` : x.name, inUse: x.id === active, colors: colors(x.vars) }));
  if (active === CUSTOM) palettes.unshift({ id: CUSTOM, name: "Palet kustom", inUse: true, colors: colors(resolvePalette(row.theme, style)) });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0">
          <Link href="/admin/undangan" prefetch={false} className="text-[13px] text-ink-mute no-underline hover:text-wine">
            Semua undangan
          </Link>
          <h1 className="truncate font-serif text-3xl leading-tight">{invitationLabel(row.slug, row.theme)}</h1>
        </div>
        <InvitationTabs slug={slug} current="palet" />
      </div>
      <p className="mt-5 max-w-[60ch] text-[15px] text-ink-body">
        Semua palet tema {THEME_NAMES[row.theme]} beserta kode warnanya. Unduh untuk dikirim ke klien saat memilih palet. Klik kode hex untuk menyalinnya.
      </p>
      <PaletteSheet theme={THEME_NAMES[row.theme]} palettes={palettes} />
    </>
  );
}

export default function PalettePage({ params }: PageProps<"/admin/undangan/[slug]/palet">) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
