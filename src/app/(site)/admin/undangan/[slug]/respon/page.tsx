import type { Metadata } from "next";
import Link from "next/link";
import { Pending } from "@/app/(site)/admin/pending";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { archiveInfo, formatDateId, isDemo } from "@/lib/invitation/archive";
import { invitationRules } from "@/lib/invitation/rules";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { listWishes } from "@/lib/wishes";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../../login-form";
import { InvitationTabs } from "../../tabs";
import { Responses, type ArchiveNotice } from "./responses";

export const metadata: Metadata = {
  title: "RSVP dan ucapan",
  robots: { index: false, follow: false },
};

async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  if (!(await currentAdmin())) return <LoginForm />;

  const { slug } = await params;
  const sb = supabaseAdmin();
  const { data: row } = await sb.from("invitations").select("id, slug, theme, data").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  // Pemberitahuan arsip muncul sejak tujuh hari sebelum beku. Kolom archive_notified_at (migrasi 0008) bisa belum ada.
  const parsed = invitationDataSchema.safeParse(row.data);
  const info = parsed.success ? archiveInfo(parsed.data, undefined, isDemo(row.slug, row.theme)) : null;
  const notified = await sb.from("invitations").select("archive_notified_at").eq("slug", slug).maybeSingle();
  const notice: ArchiveNotice | undefined =
    info?.archiveAt && (info.noticeDue || info.archived) && parsed.success
      ? {
          archiveAt: formatDateId(info.archiveAt),
          archived: info.archived,
          notifiedAt: (notified.data as { archive_notified_at?: string | null } | null)?.archive_notified_at ?? null,
          couple: [parsed.data.couple.groom.name, parsed.data.couple.bride.name].filter(Boolean).join(" & "),
        }
      : undefined;

  const exportLock = (await invitationRules(slug))?.rules.locked.ekspor_excel;
  const [rsvps, wishes, guests] = await Promise.all([
    sb.from("rsvps").select("id, name, attending, guests, created_at").eq("invitation_id", row.id).order("created_at", { ascending: false }).limit(5000),
    listWishes(row.id),
    sb.from("guests").select("name").eq("invitation_id", row.id).limit(2000),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0">
          <Link href="/admin/undangan" prefetch={false} className="text-[13px] text-ink-mute no-underline hover:text-wine has-[[data-pending]]:opacity-55">
            Semua undangan
            <Pending />
          </Link>
          <h1 className="truncate font-serif text-3xl leading-tight">{invitationLabel(row.slug, row.theme)}</h1>
        </div>
        <InvitationTabs slug={slug} current="respon" />
      </div>
      <Responses slug={slug} notice={notice} exportLock={exportLock} rsvps={rsvps.data ?? []} wishes={wishes} guestNames={(guests.data ?? []).map((g) => g.name)} />
    </>
  );
}

export default function ResponsesPage({ params }: PageProps<"/admin/undangan/[slug]/respon">) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
