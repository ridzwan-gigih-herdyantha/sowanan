import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SkipDoor } from "@/components/invitation/shell";
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

async function Preview({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  // ?atur dipakai dialog atur foto di editor: undangan langsung terbuka tanpa pembuka.
  const framing = "atur" in (await searchParams);
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
      {framing ? (
        <SkipDoor>
          <Component inv={toView(slug, data, row.theme)} />
        </SkipDoor>
      ) : (
        <Component inv={toView(slug, data, row.theme)} />
      )}
      <PreviewBridge texts={texts} media={media} sample={filled} />
    </>
  );
}

export default function PreviewPage({ params, searchParams }: PageProps<"/admin/pratinjau/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Preview params={params} searchParams={searchParams} />
    </Suspense>
  );
}
