import type { Metadata } from "next";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { PURPOSES } from "@/lib/storage/media";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, themeMedia } from "@/themes/media";
import { LoginForm } from "../login-form";
import { AdminFrame } from "../frame";
import { listMedia } from "./actions";
import { MediaManager } from "./media-manager";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

async function MediaGate() {
  if (!hasSupabase()) {
    return (
      <AdminFrame current="/admin/media" title="Media">
        <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>
      </AdminFrame>
    );
  }
  const admin = await currentAdmin();
  if (!admin)
    return (
      <AdminFrame current="/admin/media" title="Media">
        <LoginForm />
      </AdminFrame>
    );

  const { data } = await supabaseAdmin().from("invitations").select("slug, theme").order("slug");
  const slugs = (data ?? []).map((r) => r.slug as string);
  const labels = Object.fromEntries((data ?? []).map((r) => [r.slug as string, invitationLabel(r.slug, r.theme)]));
  const allowed = Object.fromEntries((data ?? []).map((r) => [r.slug as string, themeMedia(r.theme as string) as string[]]));
  const initial = slugs[0] ? await listMedia(slugs[0]) : null;
  const purposes = Object.entries(PURPOSES).map(([key, p]) => ({ key, label: p.label, kind: p.kind }));

  return (
    <AdminFrame email={admin.email ?? ""} current="/admin/media" title="Media">
      <MediaManager
      slugs={slugs}
      initialFiles={initial?.ok ? initial.data : []}
      purposes={purposes}
      allowed={allowed}
      labels={labels}
      />
    </AdminFrame>
  );
}

export default function MediaPage() {
  return (
    <div className="min-h-dvh bg-ivory">
      <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
        <MediaGate />
      </Suspense>
    </div>
  );
}
