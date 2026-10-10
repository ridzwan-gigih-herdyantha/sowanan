import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentCouple, coupleInvitation } from "@/lib/couple-auth";
import { MAX_GUESTS } from "@/lib/guests";
import { invitationRules } from "@/lib/invitation/rules";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { SITE_URL } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listWishes } from "@/lib/wishes";
import { CoupleFrame } from "../frame";
import { CoupleBoard, type BoardGuest, type BoardRsvp } from "./board";

export const metadata: Metadata = {
  title: "Dashboard mempelai",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Hanya undangan milik akun yang masuk. Belum masuk diarahkan ke halaman masuk, undangan orang lain ke dashboard sendiri.
async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await coupleInvitation(slug);
  if (!found) redirect((await currentCouple()) ? "/dashboard/user" : "/dashboard/user/login");
  const { invitation } = found;
  const d = invitationDataSchema.parse(invitation.data ?? {});
  const couple = [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ") || invitation.slug;

  const sb = supabaseAdmin();
  const [rsvps, wishes, guests, info] = await Promise.all([
    sb.from("rsvps").select("id, name, attending, guests, created_at").eq("invitation_id", invitation.id).order("created_at", { ascending: false }).limit(5000),
    listWishes(invitation.id),
    sb
      .from("guests")
      .select("id, name, sent_at, qr_token, checked_in_at, walk_in")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(MAX_GUESTS),
    invitationRules(invitation.slug),
  ]);
  const locked = info?.rules.locked ?? {};

  return (
    <CoupleFrame>
      <p className="text-[13px] tracking-[2px] text-ink-mute uppercase">Dashboard mempelai</p>
      <h1 className="mt-1 font-serif text-4xl leading-tight">{couple}</h1>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
        <a href={`${SITE_URL}/${invitation.slug}`} target="_blank" rel="noopener" className="text-wine underline underline-offset-4">
          Buka undangan
        </a>
        {!invitation.published && <span className="text-ink-mute">Undangan belum tayang, tamu belum bisa membukanya.</span>}
      </p>
      <CoupleBoard
        slug={invitation.slug}
        origin={SITE_URL}
        rsvps={(rsvps.data ?? []) as BoardRsvp[]}
        wishes={wishes}
        guests={(guests.data ?? []) as BoardGuest[]}
        excelLock={locked.ekspor_excel ?? null}
        qr={!locked.qr_absensi && !locked.nama_tamu}
        personalLinks={!locked.nama_tamu}
      />
    </CoupleFrame>
  );
}

export default function CoupleDashboard({ params }: PageProps<"/dashboard/user/[slug]">) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
      <Gate params={params} />
    </Suspense>
  );
}
