import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { currentCouple } from "@/lib/couple-auth";
import { CoupleLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk dashboard",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Yang sudah masuk langsung diteruskan ke dashboard.
async function Gate() {
  if (await currentCouple()) redirect("/dashboard/user");
  return <CoupleLoginForm />;
}

export default function CoupleLoginPage() {
  return (
    <div className="min-h-dvh bg-ivory">
      <main className="mx-auto max-w-sm px-5 py-16 sm:py-24">
        <p className="flex items-center gap-2.5 text-[13px] tracking-[3px] text-wine">
          <LogoMark className="h-6 w-auto" />
          SOWANAN
        </p>
        <h1 className="mt-2 font-serif text-[40px] leading-tight font-medium">Dashboard mempelai</h1>
        <p className="mt-2 mb-8 text-[15px] text-ink-soft">Masuk dengan username dan password yang dikirim tim Sowanan.</p>
        <Suspense fallback={<p className="text-ink-mute">Memuat...</p>}>
          <Gate />
        </Suspense>
      </main>
    </div>
  );
}
