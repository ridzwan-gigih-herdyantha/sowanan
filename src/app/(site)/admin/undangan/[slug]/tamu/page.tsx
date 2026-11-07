import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { qrEnabled, windowForSlug } from "@/lib/checkin";
import { DEFAULT_GUEST_MESSAGE, GUEST_COLS, MAX_GUESTS, SESSION_COLS, type GuestSession } from "@/lib/guests";
import { isDemo } from "@/lib/invitation/archive";
import { invitationRules } from "@/lib/invitation/rules";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { toView } from "@/lib/invitation/view";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../../login-form";
import { InvitationHeader, PAGE, PageIntro } from "../../tabs";
import type { Guest } from "./actions";
import { GuestManager } from "./guest-manager";
import { PrivateOff } from "./private-off";

export const metadata: Metadata = {
  title: "Daftar tamu",
  robots: { index: false, follow: false },
};

async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  if (!(await currentAdmin())) return <LoginForm />;

  const { slug } = await params;
  const sb = supabaseAdmin();
  const { data: row } = await sb.from("invitations").select("id, slug, theme, published, data, draft, guest_message, payment_status, private, couple_code, session_item").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const rules = (await invitationRules(slug))?.rules;
  // Add-on tamu terundang juga membuka halaman ini, karena kode tamu dibuat dari daftar tamu.
  const lock = rules?.locked.tamu_terundang ? rules.locked.nama_tamu : undefined;
  if (lock) {
    return (
      <>
        <InvitationHeader slug={slug} label={invitationLabel(row.slug, row.theme)} current="tamu" published={row.published} paid={row.payment_status !== "belum_lunas"} />
        <div className={PAGE}>
          <PageIntro title="Tamu">Tambah nama tamu, kirim link undangan pribadi lewat WhatsApp, dan pantau siapa yang sudah hadir.</PageIntro>
          <p className="rounded-sm bg-blush px-4 py-3 text-[14px]">{lock}</p>
          {row.private && <PrivateOff slug={slug} />}
        </div>
      </>
    );
  }

  const res = await sb.from("guests").select(GUEST_COLS).eq("invitation_id", row.id).order("created_at", { ascending: true }).order("id", { ascending: true }).limit(MAX_GUESTS);
  if (res.error) return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Gagal memuat daftar tamu. Muat ulang halaman.</p>;
  const guests = res.data as unknown as Guest[];
  const { data: sessions } = await sb.from("invitation_sessions").select(SESSION_COLS).eq("invitation_id", row.id).order("time").order("id");
  const live = invitationDataSchema.parse(row.data ?? {});

  const d = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  const couple = [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ");
  const date = Date.parse(d.event.start) ? toView(slug, d).dateLong : "";
  const qr = await qrEnabled(slug);

  return (
    <>
      <InvitationHeader slug={slug} label={invitationLabel(row.slug, row.theme)} current="tamu" published={row.published} paid={row.payment_status !== "belum_lunas"} />
      <div className={PAGE}>
        <PageIntro title="Tamu">Tambah nama tamu, kirim link undangan pribadi lewat WhatsApp, dan pantau siapa yang sudah hadir.</PageIntro>
        {!row.published && (
          <p className="mb-6 rounded-sm bg-blush px-4 py-3 text-[14px]">Undangan belum live. Link tamu baru bisa dibuka setelah Live dinyalakan di Editor.</p>
        )}
        <GuestManager
          slug={slug}
          origin={process.env.NEXT_PUBLIC_SITE_URL || "https://sowanan.com"}
          initial={guests}
          template={row.guest_message ?? DEFAULT_GUEST_MESSAGE}
          couple={couple}
          date={date}
          excelLock={rules?.locked.ekspor_excel ?? null}
          window={qr.enabled ? await windowForSlug(slug) : null}
          qr={qr.enabled ? { on: true } : { on: false, reason: qr.reason ?? null }}
          privateMode={{
            on: row.private,
            coupleCode: row.couple_code ?? "",
            sessions: (sessions ?? []) as GuestSession[],
            sessionItem: row.session_item ?? "",
            scheduleNames: [...new Set(live.event.schedule.map((e) => e.name).filter(Boolean))],
            lock: isDemo(row.slug, row.theme) ? "Undangan contoh tidak bisa dibuat private." : (rules?.locked.tamu_terundang ?? null),
          }}
        />
      </div>
    </>
  );
}

export default function GuestsPage({ params }: PageProps<"/admin/undangan/[slug]/tamu">) {
  return (
    <main className="mx-auto max-w-[1440px] px-5">
      <Suspense fallback={<p className="py-12 text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
