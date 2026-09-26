import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { getInvitation } from "@/lib/invitation/load";
import { editableMap, fillPreview } from "@/lib/invitation/preview";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { toView } from "@/lib/invitation/view";
import { mediaUrl } from "@/lib/storage/media";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { THEMES } from "@/themes";
import { PreviewBridge } from "./bridge";

export const metadata: Metadata = { title: "Pratinjau", robots: { index: false, follow: false } };

async function Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await currentAdmin())) return <p style={{ padding: 24 }}>Sesi berakhir. Masuk lagi di /admin.</p>;

  const { data: row } = await supabaseAdmin().from("invitations").select("theme, data, draft").eq("slug", slug).maybeSingle();
  const theme = row && THEMES[row.theme];
  if (!row || !theme) notFound();

  const draft = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  const sample = row.theme === slug ? null : ((await getInvitation(row.theme))?.data ?? null);
  const { data, filled } = fillPreview(draft, sample);
  const { texts, media } = editableMap(data, mediaUrl);
  const { Component } = theme;

  return (
    <>
      <Component inv={toView(slug, data)} />
      <PreviewBridge texts={texts} media={media} sample={filled} />
    </>
  );
}

export default function PreviewPage({ params }: PageProps<"/admin/pratinjau/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Preview params={params} />
    </Suspense>
  );
}
