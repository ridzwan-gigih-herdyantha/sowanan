import type { Metadata } from "next";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { PURPOSES } from "@/lib/storage/media";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, themeMedia } from "@/themes/media";
import { LoginForm } from "../login-form";
import { AdminNav } from "../nav";
import { listMedia } from "./actions";
import { MediaManager } from "./media-manager";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

async function MediaGate() {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  const admin = await currentAdmin();
  if (!admin) return <LoginForm />;

  const { data } = await supabaseAdmin().from("invitations").select("slug, theme").order("slug");
  const slugs = (data ?? []).map((r) => r.slug as string);
  const labels = Object.fromEntries((data ?? []).map((r) => [r.slug as string, invitationLabel(r.slug, r.theme)]));
  const allowed = Object.fromEntries((data ?? []).map((r) => [r.slug as string, themeMedia(r.theme as string) as string[]]));
  const initial = slugs[0] ? await listMedia(slugs[0]) : null;
  const purposes = Object.entries(PURPOSES).map(([key, p]) => ({ key, label: p.label, kind: p.kind }));

  return (
    <>
      <AdminNav email={admin.email ?? ""} current="/admin/media" />
      <MediaManager
      slugs={slugs}
      initialFiles={initial?.ok ? initial.data : []}
      purposes={purposes}
      allowed={allowed}
      labels={labels}
      />
    </>
  );
}

export default function MediaPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <p className="text-[13px] tracking-[3px] text-wine">SOWANAN</p>
      <h1 className="mt-2 mb-8 font-serif text-[clamp(36px,8vw,48px)] leading-tight font-medium">Media</h1>
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <MediaGate />
      </Suspense>
    </main>
  );
}
