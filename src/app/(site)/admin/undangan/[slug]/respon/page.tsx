import type { Metadata } from "next";
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
import { InvitationHeader, PAGE, PageIntro } from "../../tabs";
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
  const { data: row } = await sb.from("invitations").select("id, slug, theme, data, archive_notified_at, published, payment_status").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  // Pemberitahuan arsip muncul sejak tujuh hari sebelum beku.
  const parsed = invitationDataSchema.safeParse(row.data);
  const info = parsed.success ? archiveInfo(parsed.data, undefined, isDemo(row.slug, row.theme)) : null;
  const notice: ArchiveNotice | undefined =
    info?.archiveAt && (info.noticeDue || info.archived) && parsed.success
      ? {
          archiveAt: formatDateId(info.archiveAt),
          archived: info.archived,
          notifiedAt: row.archive_notified_at ?? null,
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
      <InvitationHeader slug={slug} label={invitationLabel(row.slug, row.theme)} current="respon" published={row.published} paid={row.payment_status !== "belum_lunas"} />
      <div className={PAGE}>
        <PageIntro title="RSVP & ucapan">Konfirmasi kehadiran dan ucapan yang masuk dari tamu. Ucapan bisa disembunyikan dari undangan kapan saja.</PageIntro>
        <Responses slug={slug} notice={notice} exportLock={exportLock} rsvps={rsvps.data ?? []} wishes={wishes} guestNames={(guests.data ?? []).map((g) => g.name)} />
      </div>
    </>
  );
}

export default function ResponsesPage({ params }: PageProps<"/admin/undangan/[slug]/respon">) {
  return (
    <main className="mx-auto max-w-[1440px] px-5">
      <Suspense fallback={<p className="py-12 text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
