import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomFontLinks } from "@/components/invitation/custom-font-links";
import { SkipDoor } from "@/components/invitation/shell";
import { currentAdmin } from "@/lib/admin-auth";
import { getInvitation } from "@/lib/invitation/load";
import { textPath } from "@/lib/invitation/texts";
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
  const view = toView(slug, data, row.theme);
  // Teks section, termasuk bawaan tema, juga bisa diklik di preview. Hasilnya tersimpan sebagai teks pilihan mempelai.
  for (const [group, slots] of Object.entries(view.texts)) for (const [slot, value] of Object.entries(slots)) texts[textPath(group, slot)] ||= value;

  return (
    <>
      <CustomFontLinks hrefs={view.fontLinks} />
      {framing ? (
        <SkipDoor>
          <Component inv={view} />
        </SkipDoor>
      ) : (
        <Component inv={view} />
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
