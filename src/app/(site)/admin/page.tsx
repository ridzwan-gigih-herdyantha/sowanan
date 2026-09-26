import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { hasSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "./actions";
import { LoginForm } from "./login-form";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Pengaturan",
  robots: { index: false, follow: false },
};

async function AdminGate() {
  if (!hasSupabase()) {
    return <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>;
  }
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return <LoginForm />;

  const settings = await getSettings();
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-[14px] text-ink-mute">
        <span>Masuk sebagai {data.user.email}</span>
        <div className="flex items-center gap-5">
          <Link href="/admin/media" prefetch={false} className="text-wine underline underline-offset-4">
            Media
          </Link>
          <form action={logout}>
            <button type="submit" className="text-wine underline underline-offset-4">
              Keluar
            </button>
          </form>
        </div>
      </div>
      <SettingsForm initial={settings} />
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <p className="text-[13px] tracking-[3px] text-wine">SOWANAN</p>
      <h1 className="mt-2 mb-8 font-serif text-[clamp(36px,8vw,48px)] leading-tight font-medium">Pengaturan</h1>
      <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
        <AdminGate />
      </Suspense>
    </main>
  );
}
