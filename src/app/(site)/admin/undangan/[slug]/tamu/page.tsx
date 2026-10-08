import type { Metadata } from "next";
import Link from "next/link";
import { Pending } from "@/app/(site)/admin/pending";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { qrEnabled, windowForSlug } from "@/lib/checkin";
import { DEFAULT_GUEST_MESSAGE, GUEST_COLS, MAX_GUESTS } from "@/lib/guests";
import { invitationRules } from "@/lib/invitation/rules";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { toView } from "@/lib/invitation/view";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../../login-form";
import { InvitationTabs } from "../../tabs";
import type { Guest } from "./actions";
import { GuestManager } from "./guest-manager";

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
  const { data: row } = await sb.from("invitations").select("id, slug, theme, published, data, draft, guest_message").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const rules = (await invitationRules(slug))?.rules;
  const lock = rules?.locked.nama_tamu;
  if (lock) {
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
          <InvitationTabs slug={slug} current="tamu" />
        </div>
        <p className="mt-5 rounded-sm bg-blush px-4 py-3 text-[14px]">{lock}</p>
      </>
    );
  }

  let guests: Guest[] | null = null;
  for (const cols of GUEST_COLS) {
    const res = await sb.from("guests").select(cols).eq("invitation_id", row.id).order("created_at", { ascending: true }).order("id", { ascending: true }).limit(MAX_GUESTS);
    if (!res.error) {
      guests = res.data as unknown as Guest[];
      break;
    }
  }
  if (!guests) return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Tabel tamu belum ada. Jalankan supabase/migrations/0004_guests.sql.</p>;

  const d = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  const couple = [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ");
  const date = Date.parse(d.event.start) ? toView(slug, d).dateLong : "";
  // QR absensi butuh kolom dari migrasi 0009. Tanpa itu fitur dianggap belum siap.
  const qr = await qrEnabled(slug);
  const columns = guests.length ? "qr_token" in guests[0] : !(await sb.from("guests").select("qr_token").limit(1)).error;

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
        <InvitationTabs slug={slug} current="tamu" />
      </div>
      {!row.published && (
        <p className="mt-5 rounded-sm bg-blush px-4 py-3 text-[14px]">Undangan belum tayang. Link tamu baru bisa dibuka setelah Tayang dinyalakan di Isi undangan.</p>
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
        qr={qr.enabled ? (columns ? { on: true } : { on: false, reason: "Terjadi kesalahan pada server" }) : { on: false, reason: qr.reason ?? null }}
      />
    </>
  );
}

export default function GuestsPage({ params }: PageProps<"/admin/undangan/[slug]/tamu">) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
