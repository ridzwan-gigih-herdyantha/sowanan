import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomFontLinks } from "@/components/invitation/custom-font-links";
import { currentAdmin } from "@/lib/admin-auth";
import { invitationRules } from "@/lib/invitation/rules";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { storyData, type StoryData } from "@/lib/invitation/story";
import { isPurpose, PURPOSES } from "@/lib/storage/media";
import { listMedia } from "../../../media/actions";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { customFontLinks } from "@/themes/fonts";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../../login-form";
import { InvitationHeader, PAGE, PageIntro } from "../../tabs";
import { StorySheet } from "./story-sheet";

export const metadata: Metadata = {
  title: "Gambar story",
  robots: { index: false, follow: false },
};

// Gambar yang bukan foto acara, seperti QRIS, preview WhatsApp, atau denah, tidak ditawarkan untuk story.
const NOT_PHOTOS = new Set(["og", "qris", "avatar", "thumb", "cover", "plan", "artcover", "artimg"]);

// Pilihan foto story: foto yang sedang dipakai undangan, lalu semua foto lain yang pernah diunggah ke storage.
async function photoChoices(slug: string, story: StoryData): Promise<string[]> {
  const p = story.photos;
  const used = [p.hero, p.wide, p.couple, p.closing, p.venue, p.groom, p.bride, ...p.extra].flatMap((x) => (x ? [x.src] : []));
  const media = await listMedia(slug);
  const uploaded = media.ok ? media.data.filter((f) => isPurpose(f.purpose) && PURPOSES[f.purpose].kind === "image" && !NOT_PHOTOS.has(f.purpose)).map((f) => f.url) : [];
  const seen = new Set<string>();
  return [...used, ...uploaded].filter((src) => {
    const key = src.split("?")[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  if (!(await currentAdmin())) return <LoginForm />;

  const { slug } = await params;
  const { data: row } = await supabaseAdmin().from("invitations").select("slug, theme, data, draft, published, payment_status").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  // Mengikuti draf, karena itu yang sedang dikerjakan admin.
  const d = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  const lock = (await invitationRules(slug))?.rules.locked.gambar_story;
  const story = lock ? null : storyData(row.slug, d, row.theme);
  const choices = story ? await photoChoices(slug, story) : [];

  return (
    <>
      <InvitationHeader slug={slug} label={invitationLabel(row.slug, row.theme)} current="story" published={row.published} paid={row.payment_status !== "belum_lunas"} />
      <div className={PAGE}>
        <PageIntro title="Story">Gambar undangan untuk story, dengan tiga pilihan desain sesuai tema. Isinya foto, nama mempelai, tanggal, lokasi, dan alamat link.</PageIntro>
        {lock ? (
          <p className="mt-6 rounded-sm bg-ivory px-4 py-3 text-[14px] text-ink-mute ring-1 ring-line">{lock}</p>
        ) : story ? (
          <>
            <CustomFontLinks hrefs={customFontLinks(d.style)} />
            <StorySheet data={story} choices={choices} />
          </>
        ) : (
          <p className="mt-6 rounded-sm bg-ivory px-4 py-3 text-[14px] text-ink-mute ring-1 ring-line">Isi nama kedua mempelai dan tanggal acara dulu di editor.</p>
        )}
      </div>
    </>
  );
}

export default function StoryPage({ params }: PageProps<"/admin/undangan/[slug]/story">) {
  return (
    <main className="mx-auto max-w-[1440px] px-5">
      <Suspense fallback={<p className="py-12 text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
