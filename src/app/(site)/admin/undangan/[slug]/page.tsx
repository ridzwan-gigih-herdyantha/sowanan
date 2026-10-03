import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { galleryLimit, getSettings, PACKAGE_NAMES, type PackageId } from "@/lib/settings";
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
  // Batas galeri mengikuti baris galeri_foto di isi paket. Tanpa batas atau paket belum dipilih berarti memakai batas tema.
  const photos = galleryLimit(await getSettings(), row.package ?? null);
  const limits =
    typeof photos === "number" ? { "sections.gallery.photos": { max: photos, note: `Paket ${PACKAGE_NAMES[row.package as PackageId]} maksimal ${photos} foto` } } : undefined;
  return <Editor limits={limits} slug={row.slug} theme={row.theme} label={invitationLabel(row.slug, row.theme)} published={row.published} paid={row.payment_status !== "belum_lunas"} pkg={row.package ?? null} draft={draft} live={live} />;
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
