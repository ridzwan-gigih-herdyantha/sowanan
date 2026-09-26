import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { invitationDataSchema } from "@/lib/invitation/schema";
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
  const { data: row } = await supabaseAdmin().from("invitations").select("slug, theme, published, data, draft").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const live = invitationDataSchema.parse(row.data ?? {});
  const draft = row.draft ? invitationDataSchema.parse(row.draft) : live;
  return <Editor slug={row.slug} theme={row.theme} label={invitationLabel(row.slug, row.theme)} published={row.published} draft={draft} live={live} />;
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
