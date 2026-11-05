// SEMENTARA: halaman uji visual template story. Dihapus sebelum selesai.
import { Suspense } from "react";
import { CustomFontLinks } from "@/components/invitation/custom-font-links";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { storyData } from "@/lib/invitation/story";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { customFontLinks } from "@/themes/fonts";
import { StorySheet } from "../admin/undangan/[slug]/story/story-sheet";

async function Lab({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const theme = q.theme ?? "andi-rina";
  const { data: row } = await supabaseAdmin().from("invitations").select("slug, theme, data, draft").eq("slug", theme).maybeSingle();
  if (!row) return <p>tidak ada</p>;
  const d = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  if (q.long) {
    d.couple.groom.name = "Muhammad Abdurrahman Prawiranegara";
    d.couple.bride.name = "Siti Nurhaliza Kusumawardhani";
    d.event.venue.name = "Gedung Serbaguna Graha Kencana Taman Budaya Nusantara Yogyakarta";
    d.monogram = "";
  }
  if (q.nophoto) {
    const m = d.media as Record<string, unknown>;
    for (const key of Object.keys(m)) if (typeof m[key] === "string" && key !== "music") m[key] = "";
    d.couple.groom.photo = "";
    d.couple.bride.photo = "";
    d.sections.gallery.photos = [];
    d.sections.couple.photos = [];
    d.sections.story.items = [];
    d.postGallery = [];
  }
  if (q.color) d.style = { ...d.style, palette: "kustom", custom: { ...(d.style as { custom?: object }).custom, paper: "#F3E8EE", accent: "#2B6E8F", ink: "#22242C" } } as typeof d.style;
  if (q.preset) d.style = { ...d.style, palette: q.preset } as typeof d.style;
  const story = storyData(row.slug, d, row.theme);
  if (!story) return <p>data kurang</p>;
  return (
    <>
      <CustomFontLinks hrefs={customFontLinks(d.style)} />
      <StorySheet data={story} />
      <script dangerouslySetInnerHTML={{ __html: `setTimeout(()=>{const r=[...document.querySelectorAll('canvas')].map(c=>{try{return c.toDataURL('image/png').length}catch(e){return 'ERR '+e.name}});const p=document.createElement('pre');p.id='export-result';p.textContent=JSON.stringify(r);document.body.append(p)},30000)` }} />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <main className="mx-auto max-w-[1100px] px-5">
      <Suspense fallback={<p>...</p>}>
        <Lab searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
