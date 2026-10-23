import type { Metadata } from "next";
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
import { InvitationHeader, PAGE, PageIntro } from "../../tabs";
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
  const { data: row } = await supabaseAdmin().from("invitations").select("id, slug, theme, data, draft, published, payment_status").eq("slug", slug).maybeSingle();
  if (!row || !THEME_NAMES[row.theme]) notFound();

  const d = invitationDataSchema.parse(row.draft ?? row.data ?? {});
  const couple = [d.couple.groom.name, d.couple.bride.name].filter(Boolean).join(" & ");
  const demo = isDemo(row.slug, row.theme);
  const account = demo ? null : await getCoupleAccount(row.id);

  return (
    <>
      <InvitationHeader slug={slug} label={invitationLabel(row.slug, row.theme)} current="akses" published={row.published} paid={row.payment_status !== "belum_lunas"} />
      <div className={PAGE}>
        <PageIntro title="Akses mempelai">Akun untuk mempelai membuka dashboard sendiri: melihat RSVP dan ucapan, serta mengirim link ke tamu.</PageIntro>
        {demo ? (
          <p className="rounded-sm bg-blush px-4 py-3 text-[14px]">Undangan contoh tidak punya akun mempelai.</p>
        ) : (
          <AccessPanel
            slug={row.slug}
            couple={couple}
            loginUrl={`${SITE_URL}/dashboard/user/login`}
            account={account && { createdAt: account.createdAt, lastSignIn: account.lastSignIn, passwordSetAt: account.passwordSetAt }}
          />
        )}
      </div>
    </>
  );
}

export default function AccessPage({ params }: PageProps<"/admin/undangan/[slug]/akses">) {
  return (
    <main className="mx-auto max-w-[1440px] px-5">
      <Suspense fallback={<p className="py-12 text-ink-mute">Memuat...</p>}>
        <Gate params={params} />
      </Suspense>
    </main>
  );
}
