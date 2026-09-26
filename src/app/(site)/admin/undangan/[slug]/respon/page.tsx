import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../../login-form";
import { InvitationTabs } from "../../tabs";
import { Responses } from "./responses";

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
  const { data: row } = await sb.from("invitations").select("id, slug, theme").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const [rsvps, wishes, guests] = await Promise.all([
    sb.from("rsvps").select("id, name, attending, guests, created_at").eq("invitation_id", row.id).order("created_at", { ascending: false }).limit(5000),
    sb.from("wishes").select("id, name, message, created_at").eq("invitation_id", row.id).order("created_at", { ascending: false }).limit(5000),
    sb.from("guests").select("name").eq("invitation_id", row.id).limit(2000),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0">
          <Link href="/admin/undangan" prefetch={false} className="text-[13px] text-ink-mute no-underline hover:text-wine">
            Semua undangan
          </Link>
          <h1 className="truncate font-serif text-3xl leading-tight">{invitationLabel(row.slug, row.theme)}</h1>
        </div>
        <InvitationTabs slug={slug} current="respon" />
      </div>
      <Responses slug={slug} rsvps={rsvps.data ?? []} wishes={wishes.data ?? []} guestNames={(guests.data ?? []).map((g) => g.name)} />
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
