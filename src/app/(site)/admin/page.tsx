import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { getSettingsFresh } from "@/lib/settings";
import { currentAdmin } from "@/lib/admin-auth";
import { hasSupabase } from "@/lib/supabase/admin";
import { LoginForm } from "./login-form";
import { SettingsForm } from "./settings/settings-form";
import { button } from "./settings/styles";
import { AdminTopBar } from "./top-bar";

export const metadata: Metadata = {
  title: "Pengaturan",
  robots: { index: false, follow: false },
};

function Login({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-sm px-5 py-16 sm:py-24">
      <p className="flex items-center gap-2.5 text-[13px] tracking-[3px] text-wine">
        <LogoMark className="h-6 w-auto" />
        SOWANAN
      </p>
      <h1 className="mt-2 mb-8 font-serif text-[40px] leading-tight font-medium">Masuk</h1>
      {children}
    </main>
  );
}

async function AdminGate() {
  if (!hasSupabase()) {
    return (
      <Login>
        <p className="rounded-sm bg-blush px-4 py-3 text-[15px]">Supabase belum dikonfigurasi di environment.</p>
      </Login>
    );
  }
  const admin = await currentAdmin();
  if (!admin) {
    return (
      <Login>
        <LoginForm />
      </Login>
    );
  }

  const settings = await getSettingsFresh();
  return (
    <>
      <AdminTopBar email={admin.email ?? ""} current="/admin" />
      <main className="mx-auto max-w-[1180px] px-4 pt-6 pb-40 sm:px-7 sm:pt-[34px]">
        <div className="mb-[22px] flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div>
            <h1 className="font-serif text-[40px] leading-none font-medium">Pengaturan</h1>
            <p className="mt-2 max-w-[58ch] text-[13.5px] text-ink-mute">Seluruh isi halaman depan dan halaman ketentuan diatur dari sini. Tidak ada teks yang tertanam di kode.</p>
          </div>
          <a href="/" target="_blank" rel="noopener" className={`${button.quiet} sm:ml-auto`}>
            Lihat halaman depan
          </a>
        </div>
        <SettingsForm initial={settings} />
      </main>
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-dvh bg-ivory text-[14px] text-[#2A2320]">
      <Suspense fallback={<p className="px-5 py-16 text-ink-mute">Memuat...</p>}>
        <AdminGate />
      </Suspense>
    </div>
  );
}
