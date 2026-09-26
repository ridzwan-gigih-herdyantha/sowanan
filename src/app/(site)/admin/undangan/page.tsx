import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { currentAdmin } from "@/lib/admin-auth";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationLabel, THEME_NAMES } from "@/themes/media";
import { LoginForm } from "../login-form";
import { AdminNav } from "../nav";
import { CreateForm } from "./create-form";

export const metadata: Metadata = {
  title: "Undangan",
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

async function List() {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  const admin = await currentAdmin();
  if (!admin) return <LoginForm />;

  const { data } = await supabaseAdmin().from("invitations").select("slug, theme, published, updated_at").order("updated_at", { ascending: false });
  const rows = data ?? [];
  const themes = Object.entries(THEME_NAMES).map(([key, name]) => ({ key, name }));

  return (
    <>
      <AdminNav email={admin.email ?? ""} current="/admin/undangan" />
      <CreateForm themes={themes} />
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {rows.map((r) => (
          <li key={r.slug} className="flex flex-wrap items-center gap-x-5 gap-y-1 py-4">
            <div className="min-w-0 flex-1">
              <Link href={`/admin/undangan/${r.slug}`} prefetch={false} className="font-serif text-xl hover:text-wine">
                {invitationLabel(r.slug, r.theme)}
              </Link>
              <p className="text-[13px] text-ink-mute">
                sowanan.com/{r.slug} · diubah {dateFmt.format(new Date(r.updated_at))}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${r.published ? "bg-wine text-white" : "bg-blush text-ink-soft"}`}>{r.published ? "Tayang" : "Draf"}</span>
            <Link href={`/admin/undangan/${r.slug}`} prefetch={false} className="text-[14px] text-wine underline underline-offset-4">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function InvitationsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <p className="text-[13px] tracking-[3px] text-wine">SOWANAN</p>
      <h1 className="mt-2 mb-8 font-serif text-[clamp(36px,8vw,48px)] leading-tight font-medium">Undangan</h1>
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <List />
      </Suspense>
    </main>
  );
}
