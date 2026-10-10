import type { Metadata } from "next";
import Link from "next/link";
import { Pending } from "@/app/(site)/admin/pending";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { getCoupleAccount } from "@/lib/couple-account";
import { isDemo } from "@/lib/invitation/archive";
import { invitationDataSchema } from "@/lib/invitation/schema";
import { SITE_URL } from "@/lib/site";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../../../login-form";
import { InvitationTabs } from "../../tabs";
import { AccessPanel } from "./access-panel";

export const metadata: Metadata = {
  title: "Akses mempelai",
  robots: { index: false, follow: false },
};

async function Gate({ params }: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  if (!(await currentAdmin())) return <LoginForm />;

  const { slug } = await params;
  const { data: row } = await supabaseAdmin().from("invitations").select("id, slug, theme, data, draft").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const d = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  const couple = [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ");
  const demo = isDemo(row.slug, row.theme);
  const account = demo ? null : await getCoupleAccount(row.id);

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
        <InvitationTabs slug={slug} current="akses" />
      </div>
      {demo ? (
        <p className="mt-6 rounded-sm bg-blush px-4 py-3 text-[14px]">Undangan contoh tidak punya akun mempelai.</p>
      ) : (
        <AccessPanel
          slug={row.slug}
          couple={couple}
          loginUrl={`${SITE_URL}/dashboard/user/login`}
          account={account && { createdAt: account.createdAt, lastSignIn: account.lastSignIn, passwordSetAt: account.passwordSetAt }}
        />
      )}
    </>
  );
}

export default function AccessPage({ params }: PageProps<"/admin/undangan/[slug]/akses">) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
