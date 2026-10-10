import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { activeUnlock, archiveInfo, editLocked, formatDateId, isDemo } from "@/lib/invitation/archive";
import { getSettingsFresh, type Purchased } from "@/lib/settings";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../login-form";
import { Editor } from "./editor";

export const metadata: Metadata = {
  title: "Edit undangan",
  robots: { index: false, follow: false },
};

async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  if (!(await currentAdmin())) return <LoginForm />;

  const { slug } = await params;
  const { data: row } = await supabaseAdmin().from("invitations").select("*").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const live = invitationDataSchema.parse(row.data ?? {});
  const draft = row.draft ? invitationDataSchema.parse(row.draft) : live;
  // Aturan paket dihitung di editor dari isi paket dan add-on di pengaturan, supaya langsung berubah saat add-on dicentang.
  const { matrix, addons, packages, payment } = await getSettingsFresh();
  // Arsip dihitung dari versi yang tayang. unlocked_until kosong berarti tidak sedang dibuka.
  const info = archiveInfo(live, undefined, isDemo(row.slug, row.theme));
  const unlockedUntil = info.archived ? activeUnlock(row.unlocked_until) : null;
  const archive = info.archiveAt
    ? { archived: info.archived, locked: editLocked(info, row.unlocked_until), archiveAt: formatDateId(info.archiveAt), unlockedUntil }
    : null;
  return <Editor archive={archive} packageData={{ matrix, addons, packages }} dp={payment.dp} bought={(row.addons as Purchased | undefined) ?? {}} slug={row.slug} theme={row.theme} label={invitationLabel(row.slug, row.theme)} published={row.published} paid={row.payment_status !== "belum_lunas"} pkg={row.package ?? null} draft={draft} live={live} />;
}

export default function EditInvitationPage({ params }: PageProps<"/admin/undangan/[slug]">) {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-24">
      <Suspense fallback={<p className="py-12 text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
